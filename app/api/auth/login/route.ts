
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'production_fallback_secret_6xks_cnhxf';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Missing credentials' }, { status: 400 });
        }

        // Query production users table
        const [rows]: any[] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const user = rows[0];
        
        // Securely compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        // Generate stateless JWT session
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name }, 
            JWT_SECRET, 
            { expiresIn: '12h' }
        );

        return NextResponse.json({ 
            token,
            user: { name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error('[AUTH_API_ERROR]', error);
        return NextResponse.json({ message: 'Internal Authentication Error' }, { status: 500 });
    }
}
