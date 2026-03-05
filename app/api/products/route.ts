
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get('module');
  try {
    let query = 'SELECT * FROM products';
    const params = [];
    if (module && module !== 'all') {
      query += ' WHERE module = ?';
      params.push(module);
    }
    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `PROD-${Date.now()}`;
    await pool.query(
      'INSERT INTO products (id, name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, body.name, body.description, body.category, body.module, body.price, body.costPrice, body.stock, body.minStockLevel, body.unit, body.image_url]
    );
    const [newProd] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return NextResponse.json((newProd as any)[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
