import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { category, amount, description, date, module } = body;
    
    await pool.query(
      'UPDATE expenses SET category = ?, amount = ?, description = ?, date = ?, module = ? WHERE id = ?',
      [category, amount, description, date, module, id]
    );
    
    return NextResponse.json({ message: 'Expense record updated' });
  } catch (error) {
    console.error('Update Expense Error:', error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Record cleared' });
  } catch (error) {
    console.error('Delete Expense Error:', error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
