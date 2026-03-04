
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url } = body;
    
    await pool.query(
      'UPDATE products SET name = ?, description = ?, category = ?, module = ?, price = ?, costPrice = ?, stock = ?, minStockLevel = ?, unit = ?, image_url = ? WHERE id = ?',
      [name, description, category, module, price, costPrice, stock, minStockLevel, unit, image_url, params.id]
    );
    
    return NextResponse.json({ message: 'Product updated' });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [params.id]);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
