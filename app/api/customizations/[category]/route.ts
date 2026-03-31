
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { getClientIp, verifyAuth } from '@/lib/auth-utils';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const allowedCategories = ['flavors', 'sizes', 'colors', 'toppings'];
const SchemaByCategory = {
  flavors: z.object({
    name: z.string().trim().min(2).max(100),
    price: z.number().min(0).max(100000),
    description: z.string().trim().max(500).optional().or(z.literal('')),
  }),
  sizes: z.object({
    name: z.string().trim().min(2).max(100),
    price: z.number().min(0).max(100000),
    serves: z.string().trim().min(1).max(100),
  }),
  colors: z.object({
    name: z.string().trim().min(2).max(100),
    price: z.number().min(0).max(100000),
    hex_value: z.string().trim().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/),
  }),
  toppings: z.object({
    name: z.string().trim().min(2).max(100),
    price: z.number().min(0).max(100000),
  }),
} as const;

export async function POST(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
    const auth = verifyAuth(req, { requireAdmin: true });
    if (!auth.authenticated) return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });

    try {
        const rateLimit = checkRateLimit({
            key: `admin:create-customization:${getClientIp(req)}`,
            limit: 30,
            windowMs: 60 * 1000,
        });
        if (!rateLimit.allowed) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const { category } = await params;
        if (!allowedCategories.includes(category)) {
            return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }

        const validation = SchemaByCategory[category as keyof typeof SchemaByCategory].safeParse(await req.json());
        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid customization payload' }, { status: 400 });
        }

        const body = validation.data;
        
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
