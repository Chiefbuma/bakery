import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { verifyAuth, getClientIp } from '@/lib/auth-utils';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const CreateUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  role: z.enum(['admin', 'staff']),
  password: z.string().min(12).max(128),
});

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req, { requireAdmin: true });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const [rows] = await pool.query('SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = verifyAuth(req, { requireAdmin: true });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const rateLimit = checkRateLimit({
      key: `admin:create-user:${getClientIp(req)}`,
      limit: 20,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const validation = CreateUserSchema.safeParse(await req.json());
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid user payload' }, { status: 400 });
    }

    const body = validation.data;
    const id = `U-${Date.now()}`;
    const hashedPassword = await bcrypt.hash(body.password, 12);

    await pool.query(
      'INSERT INTO users (id, name, email, role, password) VALUES (?, ?, ?, ?, ?)',
      [id, body.name, body.email, body.role, hashedPassword]
    );
    
    const [newUser] = await pool.query('SELECT id, name, email, role, createdAt FROM users WHERE id = ?', [id]);
    return NextResponse.json((newUser as any)[0]);
  } catch (error) {
    console.error('Create User Error:', error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
