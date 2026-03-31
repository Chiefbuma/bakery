import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { getClientIp, verifyAuth } from '@/lib/auth-utils';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const ImageValueSchema = z.string().trim().max(2000).refine((value) => {
  if (value === '') {
    return true;
  }

  if (value.startsWith('/')) {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}, 'Image must be an absolute URL or app-relative media path');

const CakeUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(8).max(1000),
  base_price: z.number().min(0).max(1000000),
  category: z.string().trim().min(2).max(50),
  ready_time: z.string().trim().min(2).max(20),
  customizable: z.boolean(),
  image_data_uri: ImageValueSchema.nullable().optional(),
});

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
  const auth = verifyAuth(req, { requireAdmin: true });
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });

  try {
    const rateLimit = checkRateLimit({
      key: `admin:update-cake:${getClientIp(req)}`,
      limit: 30,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    const validation = CakeUpdateSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid cake payload', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, base_price, category, ready_time, customizable, image_data_uri } = validation.data;
    
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
  const auth = verifyAuth(req, { requireAdmin: true });
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });

  try {
    const rateLimit = checkRateLimit({
      key: `admin:delete-cake:${getClientIp(req)}`,
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    await pool.query('DELETE FROM cakes WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CAKE_DETAIL_API_DELETE_ERROR]', error);
    return NextResponse.json({ error: "Failed to remove masterpiece" }, { status: 500 });
  }
}
