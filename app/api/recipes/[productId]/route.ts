
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
    
    for (const rcp of consumptions) {
      if (!rcp.supplyId || !rcp.amount) continue;
      await connection.query(
        'INSERT INTO recipes (productId, supplyId, amount) VALUES (?, ?, ?)',
        [productId, rcp.supplyId, rcp.amount]
      );
    }
    
    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Save Recipe Error:', error);
    return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
