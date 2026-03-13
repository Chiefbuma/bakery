
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

const allowedCategories = ['flavors', 'sizes', 'colors', 'toppings'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: 401 });

    try {
        const { category } = await params;
        if (!allowedCategories.includes(category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        const body = await req.json();
        
        if (category === 'flavors') {
            await pool.query('INSERT INTO flavors (name, price, description) VALUES (?, ?, ?)', [body.name, body.price, body.description]);
        } else if (category === 'sizes') {
            await pool.query('INSERT INTO sizes (name, price, serves) VALUES (?, ?, ?)', [body.name, body.price, body.serves]);
        } else if (category === 'colors') {
            await pool.query('INSERT INTO colors (name, price, hex_value) VALUES (?, ?, ?)', [body.name, body.price, body.hex_value]);
        } else if (category === 'toppings') {
            await pool.query('INSERT INTO toppings (name, price) VALUES (?, ?)', [body.name, body.price]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CUSTOMIZATION_POST_ERROR]', error);
        return NextResponse.json({ error: 'Failed to create option' }, { status: 500 });
    }
}
