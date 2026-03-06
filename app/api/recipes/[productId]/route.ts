
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const connection = await pool.getConnection();
  try {
    const { productId } = await params;
    const consumptions = await req.json(); 
    
    await connection.beginTransaction();
    await connection.query('DELETE FROM recipes WHERE productId = ?', [productId]);
    
    for (const c of consumptions) {
      if (!c.supplyId || !c.amount) continue;
      await connection.query(
        'INSERT INTO recipes (productId, supplyId, amount) VALUES (?, ?, ?)',
        [productId, c.supplyId, c.amount]
      );
    }
    
    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
