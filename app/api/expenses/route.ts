
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `EXP-${Date.now()}`;
    await pool.query(
      'INSERT INTO expenses (id, category, amount, description, date, module) VALUES (?, ?, ?, ?, ?, ?)',
      [id, body.category, body.amount, body.description, body.date, body.module || 'general']
    );
    const [newExp] = await pool.query('SELECT * FROM expenses WHERE id = ?', [id]);
    return NextResponse.json((newExp as any)[0]);
  } catch (error) {
    console.error('Create Expense Error:', error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
