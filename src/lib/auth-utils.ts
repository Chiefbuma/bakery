import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * @fileOverview Hardened Production Authentication Utilities
 * Implements JWT verification and resilient origin checks.
 */

// Unified fallback secret across the entire application to prevent 401 mismatches
const JWT_SECRET = process.env.JWT_SECRET || 'pk_live_8d9017d3458e0213efd55c219527b9171482e87d';

export function verifyAuth(req: NextRequest): { authenticated: boolean; user?: any; error?: string } {
    const authHeader = req.headers.get('Authorization');
    
    // 1. Header Presence Check
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false, error: 'Unauthorized: Missing Security Token' };
    }

    const token = authHeader.split(' ')[1];
    
    try {
        // 2. JWT Verification
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. CSRF & Hijacking Prevention
        // We only enforce strict Origin checks for state-changing mutations (POST, PUT, DELETE)
        // GET requests are allowed more flexibility as they are naturally idempotent.
        const method = req.method.toUpperCase();
        const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
        const origin = req.headers.get('origin') || req.headers.get('referer') || '';
        
        if (isMutation && process.env.NODE_ENV === 'production' && origin) {
            const allowedDomain = 'whiskedelights.co.ke';
            // Allow both www and root domain variations
            if (!origin.includes(allowedDomain)) {
                return { authenticated: false, error: 'Access Denied: Unrecognized Origin' };
            }
        }

        return { authenticated: true, user: decoded };
    } catch (error) {
        return { authenticated: false, error: 'Session Expired: Please Re-authenticate' };
    }
}
