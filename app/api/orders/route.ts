
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const [rows]: any = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Ledger failure" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const body = await req.json();
    const { items, deliveryInfo, totalPrice, depositAmount } = body;
    const orderNumber = `WD-${Math.floor(1000 + Math.random() * 9000)}-BK`;

    await connection.beginTransaction();

    const [orderResult]: any = await connection.query(
      'INSERT INTO orders (order_number, customer_name, customer_phone, delivery_method, delivery_address, delivery_date, total_price, deposit_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        orderNumber,
        deliveryInfo.name,
        deliveryInfo.phone,
        deliveryInfo.delivery_method,
        deliveryInfo.address,
        deliveryInfo.delivery_date,
        totalPrice,
        depositAmount
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, cake_id, name, quantity, price, customizations) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.cakeId, item.name, item.quantity, item.price, JSON.stringify(item.customizations)]
      );
    }

    await connection.commit();
    return NextResponse.json({ orderNumber, depositAmount });
  } catch (error) {
    await connection.rollback();
    console.error('[ORDER_PLACEMENT_ERROR]', error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  } finally {
    connection.release();
  }
}
