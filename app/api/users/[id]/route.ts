
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview User Detail API (Next.js 15 Async Params)
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, role, password } = body;
    
    let query = 'UPDATE users SET name = ?, email = ?, role = ?';
    const queryParams: any[] = [name, email, role];

    // Optionally update password if provided
    if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += ', password = ?';
        queryParams.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    queryParams.push(id);
    
    await pool.query(query, queryParams);
    
    return NextResponse.json({ message: 'Personnel profile updated' });
  } catch (error) {
    console.error('Update User Error:', error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Access revoked' });
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ error: "Removal failed" }, { status: 500 });
  }
}
