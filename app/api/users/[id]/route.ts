import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { verifyAuth, getClientIp } from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const UpdateUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  role: z.enum(['admin', 'staff']),
  password: z.string().min(12).max(128).optional().or(z.literal('')),
});

/**
 * @fileOverview User Detail API (Next.js 15 Async Params)
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req, { requireAdmin: true });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const rateLimit = checkRateLimit({
      key: `admin:update-user:${getClientIp(req)}`,
      limit: 30,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    const validation = UpdateUserSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid user payload' }, { status: 400 });
    }

    const body = validation.data;
    const { name, email, role, password } = body;
    const [targetRows]: any[] = await pool.query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [id]);
    if (targetRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetRows[0].role === 'admin' && role !== 'admin') {
      const [adminCountRows]: any[] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['admin']);
      if (Number(adminCountRows[0]?.count || 0) <= 1) {
        return NextResponse.json({ error: 'Cannot demote the last admin' }, { status: 400 });
      }
    }
    
    let query = 'UPDATE users SET name = ?, email = ?, role = ?';
    const queryParams: any[] = [name, email, role];

    // Optionally update password if provided
    if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 12);
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

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = verifyAuth(req, { requireAdmin: true });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const rateLimit = checkRateLimit({
      key: `admin:delete-user:${getClientIp(req)}`,
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const { id } = await params;
    if (auth.user?.id === id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    const [targetRows]: any[] = await pool.query('SELECT id, role FROM users WHERE id = ? LIMIT 1', [id]);
    if (targetRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetRows[0].role === 'admin') {
      const [adminCountRows]: any[] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['admin']);
      if (Number(adminCountRows[0]?.count || 0) <= 1) {
        return NextResponse.json({ error: 'Cannot delete the last admin' }, { status: 400 });
      }
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Access revoked' });
  } catch (error) {
    console.error('Delete User Error:', error);
    return NextResponse.json({ error: "Removal failed" }, { status: 500 });
  }
}
