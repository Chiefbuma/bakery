
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * Production-ready JWT authentication verifier.
 * Checks for Bearer token in the Authorization header.
 */
export function verifyAuth(req: NextRequest): { authenticated: boolean; user?: any; error?: string } {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        return { authenticated: false, error: 'Internal Auth Configuration Missing' };
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false, error: 'Unauthorized Access' };
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { authenticated: true, user: decoded };
    } catch (error) {
        return { authenticated: false, error: 'Session Expired' };
    }
}
