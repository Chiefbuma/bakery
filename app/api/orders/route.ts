import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Bakery Orders API (DB Backed)
 */
export async function GET() {
  try {
    const [rows]: any = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch Orders Error:', error);
    return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const connection = await pool.getConnection();
  try {
    const body = await req.json();
    const { items, deliveryInfo, totalPrice, depositAmount } = body;
    const orderNumber = `WD-${Math.floor(1000 + Math.random() * 9000)}-BK`;

    await connection.beginTransaction();

    const [orderResult]: any = await connection.query(
      'INSERT INTO orders (order_number, customer_name, customer_phone, delivery_method, delivery_address, delivery_date, total_price, deposit_amount, payment_status, order_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        orderNumber,
        deliveryInfo.name,
        deliveryInfo.phone,
        deliveryInfo.delivery_method,
        deliveryInfo.address,
        deliveryInfo.delivery_date,
        totalPrice,
        depositAmount,
        'pending',
        'processing'
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
    console.error('Place Order Error:', error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  } finally {
    connection.release();
  }
}
