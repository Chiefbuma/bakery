import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Handles Product updates and deletions.
 * Next.js 15 requires awaiting params before use.
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url } = body;
    
    await pool.query(
      'UPDATE products SET name = ?, description = ?, category = ?, module = ?, price = ?, costPrice = ?, stock = ?, minStockLevel = ?, unit = ?, image_url = ? WHERE id = ?',
      [name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url, id]
    );
    
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update Product Error:', error);
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return NextResponse.json({ error: "Cannot delete product" }, { status: 500 });
  }
}