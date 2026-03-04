
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, category, module, quantity, unit, unitCost } = body;
    
    await pool.query(
      'UPDATE supplies SET name = ?, category = ?, module = ?, quantity = ?, unit = ?, unitCost = ? WHERE id = ?',
      [name, category, module, quantity, unit, unitCost, params.id]
    );
    
    return NextResponse.json({ message: 'Supply updated' });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await pool.query('DELETE FROM supplies WHERE id = ?', [params.id]);
    return NextResponse.json({ message: 'Supply deleted' });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
