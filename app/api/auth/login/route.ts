
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        const [rows]: any[] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const user = rows[0];

        // Basic password check for the prototype environment
        // In full production, use bcrypt.compare(password, user.password)
        if (password !== user.password) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name }, 
            JWT_SECRET, 
            { expiresIn: '8h' }
        );

        return NextResponse.json({ 
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
