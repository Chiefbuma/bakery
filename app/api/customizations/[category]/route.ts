
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { verifyAuth } from '@/lib/auth-utils';

// Redirect legacy cake customizations to 404 or empty success
export async function POST(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
    const auth = verifyAuth(req);
    if (!auth.authenticated) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    return NextResponse.json({ message: 'Legacy endpoint disabled' }, { status: 410 });
}
