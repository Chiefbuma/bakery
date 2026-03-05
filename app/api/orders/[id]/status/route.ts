
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

const allowedStatuses = ['processing', 'complete', 'cancelled'];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const connection = await pool.getConnection();
    try {
        const { id } = await params;
        const { status } = await req.json();

        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const [result]: any = await connection.query('UPDATE transactions SET status = ? WHERE id = ?', [status === 'complete' ? 'paid' : 'pending', id]);
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    } finally {
        connection.release();
    }
}
