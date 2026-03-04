
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const module = searchParams.get('module');
  try {
    let query = 'SELECT * FROM supplies';
    const params = [];
    if (module && module !== 'all') {
      query += ' WHERE module = ?';
      params.push(module);
    }
    const [rows] = await pool.query(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch supplies" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `SUP-${Date.now()}`;
    await pool.query(
      'INSERT INTO supplies (id, name, category, module, quantity, unit, unitCost) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, body.name, body.category, body.module, body.quantity, body.unit, body.unitCost]
    );
    const [newSup] = await pool.query('SELECT * FROM supplies WHERE id = ?', [id]);
    return NextResponse.json((newSup as any)[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create supply" }, { status: 500 });
  }
}
