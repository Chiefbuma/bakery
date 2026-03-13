
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows]: any = await pool.query(`
      SELECT so.*, c.name, c.description, c.base_price, c.image_data_uri, c.category, c.ready_time, c.rating, c.orders_count
      FROM special_offers so
      JOIN cakes c ON so.cake_id = c.id
      LIMIT 1
    `);

    if (rows.length === 0) return NextResponse.json(null, { status: 404 });

    const offer = rows[0];
    const discount = offer.discount_percentage / 100;
    const specialPrice = offer.base_price * (1 - discount);

    return NextResponse.json({
      cake: {
        id: offer.cake_id,
        name: offer.name,
        description: offer.description,
        base_price: offer.base_price,
        image_data_uri: offer.image_data_uri,
        category: offer.category,
        ready_time: offer.ready_time,
        rating: offer.rating,
        orders_count: offer.orders_count
      },
      discount_percentage: offer.discount_percentage,
      original_price: offer.base_price,
      special_price: specialPrice,
      savings: offer.base_price - specialPrice
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch offer" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const connection = await pool.getConnection();
  try {
    const { cake_id, discount_percentage } = await req.json();
    await connection.beginTransaction();
    await connection.query('DELETE FROM special_offers'); // Only one special offer allowed
    await connection.query('INSERT INTO special_offers (cake_id, discount_percentage) VALUES (?, ?)', [cake_id, discount_percentage]);
    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  } finally {
    connection.release();
  }
}
