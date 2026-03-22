import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * @fileOverview Production Authentication Utilities
 * Hardened for WhiskeDelights with strict JWT verification and CSRF protection.
 */

const JWT_SECRET = process.env.JWT_SECRET || 'production_fallback_secret_6xks_cnhxf';

export function verifyAuth(req: NextRequest): { authenticated: boolean; user?: any; error?: string } {
    const authHeader = req.headers.get('Authorization');
    
    // 1. Basic Presence Check
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false, error: 'Authorization header missing' };
    }

    const token = authHeader.split(' ')[1];
    
    try {
        // 2. JWT Verification (Prevents hijacking)
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Optional: CSRF Validation
        // Ensure request comes from allowed origin in production
        const origin = req.headers.get('origin') || req.headers.get('referer');
        if (process.env.NODE_ENV === 'production' && origin && !origin.includes('whiskedelights.co.ke')) {
            return { authenticated: false, error: 'Invalid Origin (CSRF Protection)' };
        }

        return { authenticated: true, user: decoded };
    } catch (error) {
        return { authenticated: false, error: 'Session Expired or Invalid Token' };
    }
}
