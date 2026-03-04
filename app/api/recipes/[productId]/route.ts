
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const connection = await pool.getConnection();
  try {
    const resolvedParams = await params;
    const { productId } = resolvedParams;
    const consumptions = await req.json(); 
    
    await connection.beginTransaction();
    
    // Clear existing recipe mapping
    await connection.query('DELETE FROM recipes WHERE productId = ?', [productId]);
    
    // Insert new mappings
    for (const c of consumptions) {
      await connection.query(
        'INSERT INTO recipes (productId, supplyId, amount) VALUES (?, ?, ?)',
        [productId, c.supplyId, c.amount]
      );
    }
    
    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error('Save Recipe Error:', error);
    return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 });
  } finally {
    connection.release();
  }
}
