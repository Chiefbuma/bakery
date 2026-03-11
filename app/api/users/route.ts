
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = `U-${Date.now()}`;
    
    // Hash password before storage
    const passwordToHash = body.password || 'staff123';
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

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
