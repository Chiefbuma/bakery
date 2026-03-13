
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

const allowedStatuses = ['processing', 'complete', 'cancelled'];

/**
 * @fileOverview Production Order Status API
 * Updates the order state in the 'orders' table.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const connection = await pool.getConnection();
    try {
        const { id } = await params;
        const { status } = await req.json();

        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

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
