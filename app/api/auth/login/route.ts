import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAuthToken, getClientIp, setAuthCookie } from '@/lib/auth-utils';
import { ensureDevelopmentAdmin } from '@/lib/dev-admin';

export const dynamic = 'force-dynamic';

// Schema for Input Validation (DDoS/Payload Protection)
const LoginSchema = z.object({
    email: z.string().trim().toLowerCase().email().max(255),
    password: z.string().min(8).max(128),
});

/**
 * @fileOverview Secure Admin Login API
 * Implements Rate Limiting, SQLi Prevention (via Prepared Statements), and Input Validation.
 */
export async function POST(req: NextRequest) {
    try {
        const rateLimit = checkRateLimit({
            key: `auth:login:${getClientIp(req)}`,
            limit: 5,
            windowMs: 15 * 60 * 1000,
        });
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { message: 'Too many login attempts. Please try again later.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
                }
            );
        }

        await ensureDevelopmentAdmin();
        const body = await req.json();
        
        // 1. Input Validation (Prevents Malformed Payloads)
        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ message: 'Invalid Input Format' }, { status: 400 });
        }

        const { email, password } = validation.data;

        // 2. SQL Injection Prevention (Prepared Statements)
        const [rows]: any[] = await pool.query(
            'SELECT id, name, email, role, password FROM users WHERE email = ? LIMIT 1',
            [email]
        );
        
        if (rows.length === 0) {
            return NextResponse.json({ message: 'Authentication Failed' }, { status: 401 });
        }

        const user = rows[0];
        
        // 3. Secure Password Comparison
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Authentication Failed' }, { status: 401 });
        }

        // 4. Stateless JWT Generation
        const token = createAuthToken({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });

        const response = NextResponse.json({
            user: { name: user.name, email: user.email, role: user.role }
        });
        setAuthCookie(response, token);
        return response;

    } catch (error) {
        console.error('[AUTH_API_CRITICAL_ERROR]', error);
        return NextResponse.json({ message: 'Internal Server Security Boundary' }, { status: 500 });
    }
}
