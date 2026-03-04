
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const connection = await pool.getConnection();
  try {
    const { productId } = await params;
    const consumptions = await req.json(); // Array of { supplyId, amount }
    
    await connection.beginTransaction();
    
    // Clear existing recipe
    await connection.query('DELETE FROM recipes WHERE productId = ?', [productId]);
    
    // Insert new components
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
