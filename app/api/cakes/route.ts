import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Bakery Cakes API (DB Backed)
 */
export async function GET() {
  try {
    const [rows]: any = await pool.query('SELECT * FROM cakes ORDER BY orders_count DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Fetch Cakes Error:', error);
    return NextResponse.json({ error: "Failed to fetch catalog" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, base_price, category, ready_time, customizable } = body;
    
    await pool.query(
      'INSERT INTO cakes (id, name, description, base_price, category, ready_time, customizable, orders_count, rating) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)',
      [id, name, description, base_price, category, ready_time, customizable ? 1 : 0]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create Cake Error:', error);
    return NextResponse.json({ error: "Failed to add creation" }, { status: 500 });
  }
}
