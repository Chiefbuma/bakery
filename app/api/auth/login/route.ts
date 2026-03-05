
import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'pk_live_8d9017d3458e0213efd55c219527b9171482e87d';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and access key are required' }, { status: 400 });
        }

        const [rows]: any[] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const user = rows[0];

        if (password !== user.password) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name }, 
            JWT_SECRET, 
            { expiresIn: '12h' }
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
        console.error('Login API Error:', error);
        return NextResponse.json({ message: 'Internal Server Authentication Error' }, { status: 500 });
    }
}
