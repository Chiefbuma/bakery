
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, role } = body;
    await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
    return NextResponse.json({ message: 'User updated' });
  } catch (error) {
    console.error('Update User Error:', error);
    return NextResponse.json({ message: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ message: 'Delete failed' }, { status: 500 });
  }
}
