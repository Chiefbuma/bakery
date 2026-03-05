
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [orders]: any = await pool.query('SELECT * FROM transactions WHERE status = "pending" ORDER BY timestamp DESC');
    
    for (const order of orders) {
      const [items] = await pool.query('SELECT * FROM transaction_items WHERE transactionId = ?', [order.id]);
      order.items = items;
    }
    
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pending orders" }, { status: 500 });
  }
}
