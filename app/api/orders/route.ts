
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
    console.error('[ORDERS_LEDGER_ERROR]', error);
    return NextResponse.json({ error: "Failed to load order ledger" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const connection = await pool.getConnection();
  try {
    const body = await req.json();
    const { items, deliveryInfo, totalPrice, depositAmount } = body;
    const orderNumber = `WD-${Math.floor(1000 + Math.random() * 9000)}-BK`;

    await connection.beginTransaction();

    // Persist with GPS Coordinates for Precise Delivery Auditing
    const [orderResult]: any = await connection.query(
      'INSERT INTO orders (order_number, customer_name, customer_phone, delivery_method, delivery_address, latitude, longitude, delivery_date, total_price, deposit_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        orderNumber,
        deliveryInfo.name,
        deliveryInfo.phone,
        deliveryInfo.delivery_method,
        deliveryInfo.address || deliveryInfo.pickup_location,
        deliveryInfo.latitude || null,
        deliveryInfo.longitude || null,
        deliveryInfo.delivery_date,
        totalPrice,
        depositAmount
      ]
    );

    const orderId = orderResult.insertId;

    if (items && Array.isArray(items)) {
      for (const item of items) {
        // Handle potential customization structure
        const customizations = item.customizations || {};
        
        await connection.query(
          'INSERT INTO order_items (order_id, cake_id, name, quantity, price, customizations) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, item.cakeId, item.name, item.quantity, item.price, JSON.stringify(customizations)]
        );
        
        // Update Popularity Ranking
        await connection.query('UPDATE cakes SET orders_count = orders_count + 1 WHERE id = ?', [item.cakeId]);
      }
    }

    await connection.commit();
    return NextResponse.json({ orderNumber, depositAmount });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('[ORDER_PLACEMENT_ERROR]', error);
    return NextResponse.json({ error: "Order processing failed" }, { status: 500 });
  } finally {
    connection.release();
  }
}
