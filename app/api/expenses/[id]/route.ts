
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { category, amount, description, date, module } = body;
    
    await pool.query(
      'UPDATE expenses SET category = ?, amount = ?, description = ?, date = ?, module = ? WHERE id = ?',
      [category, amount, description, date, module, params.id]
    );
    
    return NextResponse.json({ message: 'Expense updated' });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await pool.query('DELETE FROM expenses WHERE id = ?', [params.id]);
    return NextResponse.json({ message: 'Expense deleted' });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
