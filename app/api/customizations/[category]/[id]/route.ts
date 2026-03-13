
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

const allowedCategories = ['flavors', 'sizes', 'colors', 'toppings'];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ category: string, id: string }> }) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: 401 });

    try {
        const { category, id } = await params;
        if (!allowedCategories.includes(category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        const body = await req.json();
        
        if (category === 'flavors') {
            await pool.query('UPDATE flavors SET name = ?, price = ?, description = ? WHERE id = ?', [body.name, body.price, body.description, id]);
        } else if (category === 'sizes') {
            await pool.query('UPDATE sizes SET name = ?, price = ?, serves = ? WHERE id = ?', [body.name, body.price, body.serves, id]);
        } else if (category === 'colors') {
            await pool.query('UPDATE colors SET name = ?, price = ?, hex_value = ? WHERE id = ?', [body.name, body.price, body.hex_value, id]);
        } else if (category === 'toppings') {
            await pool.query('UPDATE toppings SET name = ?, price = ? WHERE id = ?', [body.name, body.price, id]);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CUSTOMIZATION_PUT_ERROR]', error);
        return NextResponse.json({ error: 'Failed to update option' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ category: string, id: string }> }) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: 401 });

    try {
        const { category, id } = await params;
        if (!allowedCategories.includes(category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        await pool.query(`DELETE FROM ${category} WHERE id = ?`, [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CUSTOMIZATION_DELETE_ERROR]', error);
        return NextResponse.json({ error: 'Failed to delete option' }, { status: 500 });
    }
}
