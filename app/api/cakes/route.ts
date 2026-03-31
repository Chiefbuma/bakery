
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

const CakeSchema = z.object({
  id: z.string().trim().min(3).max(100).regex(/^[a-z0-9-]+$/),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(8).max(1000),
  base_price: z.number().min(0).max(1000000),
  category: z.string().trim().min(2).max(50),
  ready_time: z.string().trim().min(2).max(20),
  customizable: z.boolean(),
  image_data_uri: ImageValueSchema.nullable().optional(),
});

export async function GET() {
  try {
    const [rows]: any = await pool.query('SELECT * FROM cakes ORDER BY orders_count DESC');
    return NextResponse.json(rows || []);
  } catch (error) {
    console.error('[CAKES_API_GET_ERROR]', error);
    // Return an empty array instead of 500 to keep the UI from crashing during DB setup
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req, { requireAdmin: true });
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });

  try {
    const rateLimit = checkRateLimit({
      key: `admin:create-cake:${getClientIp(req)}`,
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const validation = CakeSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid cake payload', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { id, name, description, base_price, category, ready_time, customizable, image_data_uri } = validation.data;
    
    await pool.query(
      'INSERT INTO cakes (id, name, description, base_price, category, ready_time, customizable, image_data_uri) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, description, base_price, category, ready_time, customizable ? 1 : 0, image_data_uri]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CAKES_API_POST_ERROR]', error);
    return NextResponse.json({ error: "Failed to add masterpiece" }, { status: 500 });
  }
}
