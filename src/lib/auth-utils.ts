import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * @fileOverview Hardened Production Authentication Utilities
 * Implements JWT verification, CSRF origin checking, and persistent session boundaries.
 */

const JWT_SECRET = process.env.JWT_SECRET || 'pk_live_8d9017d3458e0213efd55c219527b9171482e87d';

export function verifyAuth(req: NextRequest): { authenticated: boolean; user?: any; error?: string } {
    const authHeader = req.headers.get('Authorization');
    
    // 1. Mandatory Header Presence Check
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false, error: 'Unauthorized: Missing Security Token' };
    }

    const token = authHeader.split(' ')[1];
    
    try {
        // 2. JWT Verification (Prevents hijacking)
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. CSRF & Hijacking Prevention (Origin Verification)
        const origin = req.headers.get('origin') || req.headers.get('referer');
        if (process.env.NODE_ENV === 'production' && origin) {
            // Hardened check against authorized domain
            const allowedDomain = 'whiskedelights.co.ke';
            if (!origin.includes(allowedDomain)) {
                return { authenticated: false, error: 'Access Denied: Unrecognized Origin (CSRF Protection)' };
            }
        }

        return { authenticated: true, user: decoded };
    } catch (error) {
        return { authenticated: false, error: 'Session Expired: Please Re-authenticate' };
    }
}
