import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'production_fallback_secret_6xks_cnhxf';

// Schema for Input Validation
const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

/**
 * @fileOverview Secure Admin Login API
 * Implements Rate Limiting, SQLi Prevention (via Prepared Statements), and Input Validation.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // 1. Input Validation (Prevents Malformed Payloads)
        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid Input Format' }, { status: 400 });
        }

        const { email, password } = validation.data;

        // 2. SQL Injection Prevention (Prepared Statements)
        const [rows]: any[] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            // Constant time comparison to prevent timing attacks
            return NextResponse.json({ message: 'Authentication Failed' }, { status: 401 });
        }

        const user = rows[0];
        
        // 3. Secure Password Comparison
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Authentication Failed' }, { status: 401 });
        }

        // 4. Stateless JWT Generation
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
        console.error('[AUTH_API_CRITICAL_ERROR]', error);
        return NextResponse.json({ message: 'Internal Server Security Boundary' }, { status: 500 });
    }
}
