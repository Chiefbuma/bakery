import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Individual Cake API
 * Resolves 410 errors by providing a direct fetch for single recipes.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const [rows]: any = await pool.query('SELECT * FROM cakes WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('[CAKE_DETAIL_API_ERROR]', error);
    return NextResponse.json({ error: "Failed to load recipe" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req);
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, base_price, category, ready_time, customizable, image_data_uri } = body;
    
    await pool.query(
      'UPDATE cakes SET name = ?, description = ?, base_price = ?, category = ?, ready_time = ?, customizable = ?, image_data_uri = ? WHERE id = ?',
      [name, description, base_price, category, ready_time, customizable ? 1 : 0, image_data_uri, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CAKE_DETAIL_API_PUT_ERROR]', error);
    return NextResponse.json({ error: "Failed to update masterpiece" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req);
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const { id } = await params;
    await pool.query('DELETE FROM cakes WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CAKE_DETAIL_API_DELETE_ERROR]', error);
    return NextResponse.json({ error: "Failed to remove masterpiece" }, { status: 500 });
  }
}
