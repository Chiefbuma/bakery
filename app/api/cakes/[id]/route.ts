import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';

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

export async function PUT() { return new NextResponse(null, { status: 405 }); }
export async function DELETE() { return new NextResponse(null, { status: 405 }); }
