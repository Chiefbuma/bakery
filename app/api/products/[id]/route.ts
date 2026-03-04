
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
    
    return NextResponse.json({ message: 'Product synchronized' });
  } catch (error) {
    console.error('API Sync Error:', error);
    return NextResponse.json({ error: "Update rejected by server" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Resource removed' });
  } catch (error) {
    console.error('API Sync Error:', error);
    return NextResponse.json({ error: "Deletion failed (Resource may be linked to sales)" }, { status: 500 });
  }
}
