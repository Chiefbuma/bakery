
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

const allowedStatuses = ['processing', 'complete', 'cancelled'];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const connection = await pool.getConnection();
    try {
        const { id } = await params;
        const { status } = await req.json();

        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const [result]: any = await connection.query('UPDATE transactions SET status = ? WHERE id = ?', [status === 'complete' ? 'paid' : 'pending', id]);
        
        if (result.affectedRows === 0) {
            connection.release();
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }
        
        const [updatedOrderRows]: any = await connection.query('SELECT * FROM transactions WHERE id = ?', [id]);
        connection.release();
        
        return NextResponse.json(updatedOrderRows[0]);
    } catch (error) {
        connection.release();
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`API Error (PUT /orders/${(await params).id}/status):`, error);
        return NextResponse.json({ message: `Failed to update order status: ${message}` }, { status: 500 });
    }
}
