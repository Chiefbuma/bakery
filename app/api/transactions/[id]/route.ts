import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { customerName, status, paymentMethod } = body;
    
    await pool.query(
      'UPDATE transactions SET customerName = ?, status = ?, paymentMethod = ? WHERE id = ?',
      [customerName, status, paymentMethod, id]
    );
    
    return NextResponse.json({ message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Update Transaction Error:', error);
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Use transaction to ensure both items and parent are deleted
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('DELETE FROM transaction_items WHERE transactionId = ?', [id]);
        await connection.query('DELETE FROM transactions WHERE id = ?', [id]);
        await connection.commit();
    } catch (e) {
        await connection.rollback();
        throw e;
    } finally {
        connection.release();
    }
    
    return NextResponse.json({ message: 'Transaction removed' });
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    return NextResponse.json({ error: "Database removal failed" }, { status: 500 });
  }
}