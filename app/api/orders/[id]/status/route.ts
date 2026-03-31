
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp, verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

const allowedStatuses = ['processing', 'complete', 'cancelled'];
const StatusSchema = z.object({
  status: z.enum(['processing', 'complete', 'cancelled']),
});

/**
 * @fileOverview Production Order Status API
 * Updates the order state in the 'orders' table.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = verifyAuth(req, { requireAdmin: true });
    if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
    }

    const connection = await pool.getConnection();
    try {
        const rateLimit = checkRateLimit({
            key: `admin:update-order:${getClientIp(req)}`,
            limit: 40,
            windowMs: 60 * 1000,
        });
        if (!rateLimit.allowed) {
            return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
        }

        const { id } = await params;
        const validation = StatusSchema.safeParse(await req.json());
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }
        const { status } = validation.data;

        // Standardized production update
        const [result]: any = await connection.query(
            'UPDATE orders SET order_status = ?, payment_status = ? WHERE id = ?', 
            [status, status === 'complete' ? 'paid' : 'pending', id]
        );
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[ORDER_STATUS_UPDATE_ERROR]', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        connection.release();
    }
}
