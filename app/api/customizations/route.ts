
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview WhiskeDelights Customizations API
 */
export async function GET() {
  try {
    const [flavors] = await pool.query('SELECT * FROM flavors ORDER BY name ASC');
    const [sizes] = await pool.query('SELECT * FROM sizes ORDER BY price ASC');
    const [colors] = await pool.query('SELECT * FROM colors ORDER BY name ASC');
    const [toppings] = await pool.query('SELECT * FROM toppings ORDER BY name ASC');

    return NextResponse.json({
      flavors,
      sizes,
      colors,
      toppings
    });
  } catch (error) {
    console.error('Fetch Customizations Error:', error);
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}
