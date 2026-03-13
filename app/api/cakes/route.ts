
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

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
  const auth = verifyAuth(req);
  if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const body = await req.json();
    const { id, name, description, base_price, category, ready_time, customizable, image_data_uri } = body;
    
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
