
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url } = body;
    
    await pool.query(
      'UPDATE products SET name = ?, description = ?, category = ?, module = ?, price = ?, costPrice = ?, stock = ?, minStockLevel = ?, unit = ?, image_url = ? WHERE id = ?',
      [name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url, id]
    );
    
    return NextResponse.json({ message: 'Product updated' });
  } catch (error) {
    console.error('Update Product Error:', error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
