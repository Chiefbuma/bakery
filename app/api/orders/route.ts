import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getClientIp, verifyAuth } from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limit';
import { OrderPricingError, OrderRequestSchema, priceOrder } from '@/lib/order-pricing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req, { requireAdmin: true });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const [rows]: any = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('[ORDERS_LEDGER_ERROR]', error);
    return NextResponse.json({ error: 'Failed to load order ledger' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const connection = await pool.getConnection();
  let transactionStarted = false;
  let requestPaymentReference: string | null = null;

  try {
    const rateLimit = checkRateLimit({
      key: `order:create:${getClientIp(req)}`,
      limit: 10,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await req.json();
    const validation = OrderRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid payload structure', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { items, deliveryInfo, paymentConfirmed, paymentReference } = validation.data;
    if (!paymentReference) {
      return NextResponse.json(
        { error: 'Payment reference is required before saving an order' },
        { status: 400 }
      );
    }
    requestPaymentReference = paymentReference;
    const paymentStatus = paymentConfirmed ? 'paid' : 'pending';

    await connection.beginTransaction();
    transactionStarted = true;

    const [existingRows]: any = await connection.query(
      'SELECT order_number, deposit_amount, total_price, payment_status FROM orders WHERE payment_reference = ? LIMIT 1',
      [paymentReference]
    );
    if (Array.isArray(existingRows) && existingRows.length > 0) {
      await connection.rollback();
      transactionStarted = false;
      return NextResponse.json({
        orderNumber: existingRows[0].order_number,
        depositAmount: Number(existingRows[0].deposit_amount) || 0,
        totalAmount: Number(existingRows[0].total_price) || 0,
        paymentStatus: existingRows[0].payment_status === 'paid' ? 'paid' : 'pending',
      });
    }

    const pricedOrder = await priceOrder(connection, items);
    const orderNumber = `WD-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;

    const [orderResult]: any = await connection.query(
      'INSERT INTO orders (order_number, payment_reference, customer_name, customer_phone, delivery_method, delivery_address, latitude, longitude, delivery_date, total_price, deposit_amount, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        orderNumber,
        paymentReference,
        deliveryInfo.name,
        deliveryInfo.phone,
        deliveryInfo.delivery_method,
        deliveryInfo.address || 'Nairobi Main Bakery',
        deliveryInfo.latitude || null,
        deliveryInfo.longitude || null,
        deliveryInfo.date,
        pricedOrder.totalAmount,
        pricedOrder.depositAmount,
        paymentStatus,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of pricedOrder.items) {
      await connection.query(
        'INSERT INTO order_items (order_id, cake_id, name, quantity, price, customizations) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.cakeId, item.name, item.quantity, item.unitPrice, JSON.stringify(item.customizations)]
      );
      if (paymentConfirmed) {
        await connection.query('UPDATE cakes SET orders_count = orders_count + 1 WHERE id = ?', [item.cakeId]);
      }
    }

    await connection.commit();

    return NextResponse.json({
      orderNumber,
      depositAmount: pricedOrder.depositAmount,
      totalAmount: pricedOrder.totalAmount,
      paymentStatus,
    });
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }

    if ((error as { code?: string })?.code === 'ER_DUP_ENTRY') {
      const reference = requestPaymentReference;

      if (reference) {
        const [rows]: any = await pool.query(
          'SELECT order_number, deposit_amount, total_price, payment_status FROM orders WHERE payment_reference = ? LIMIT 1',
          [reference]
        );

        if (Array.isArray(rows) && rows.length > 0) {
          return NextResponse.json({
            orderNumber: rows[0].order_number,
            depositAmount: Number(rows[0].deposit_amount) || 0,
            totalAmount: Number(rows[0].total_price) || 0,
            paymentStatus: rows[0].payment_status === 'paid' ? 'paid' : 'pending',
          });
        }
      }
    }

    if (error instanceof OrderPricingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('[ORDER_PLACEMENT_ERROR]', error);
    return NextResponse.json({ error: 'Order processing failed' }, { status: 500 });
  } finally {
    connection.release();
  }
}
