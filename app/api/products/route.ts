import { NextResponse } from 'next/server';
import pool from '@/lib/db';

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
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url } = body;
    await pool.query(
      'INSERT INTO products (id, name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url]
    );
    return NextResponse.json({ message: 'Success' });
  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}
