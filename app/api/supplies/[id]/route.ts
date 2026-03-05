import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, category, module, quantity, unit, unitCost } = body;
    
    await pool.query(
      'UPDATE supplies SET name = ?, category = ?, module = ?, quantity = ?, unit = ?, unitCost = ? WHERE id = ?',
      [name, category, module, quantity, unit, unitCost, id]
    );
    
    return NextResponse.json({ message: 'Supply updated' });
  } catch (error) {
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM supplies WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Supply deleted' });
  } catch (error) {
    return NextResponse.json({ error: "Database removal failed" }, { status: 500 });
  }
}
