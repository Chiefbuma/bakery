import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAllowedOrigins, getJwtSecret } from '@/lib/env';

/**
 * @fileOverview Hardened Production Authentication Utilities
 * Implements JWT verification and resilient origin checks.
 */

const AUTH_COOKIE_NAME = 'wd_admin_session';

export type AuthUser = {
  id: string;
  email: string;
  role: 'admin' | 'staff';
  name: string;
};

function getTokenFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }

  return req.cookies.get(AUTH_COOKIE_NAME)?.value || null;
}

function isAllowedOrigin(originHeader: string) {
  if (!originHeader) {
    return false;
  }

  try {
    const origin = new URL(originHeader).origin;
    return getAllowedOrigins().includes(origin);
  } catch {
    return false;
  }
}

export function createAuthToken(user: AuthUser) {
  return jwt.sign(user, getJwtSecret(), {
    algorithm: 'HS256',
    audience: 'whiskedelights-admin',
    issuer: 'whiskedelights',
    expiresIn: '2h',
  });
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 2,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function verifyAuth(
  req: NextRequest,
  options: { requireAdmin?: boolean } = {}
): { authenticated: boolean; user?: AuthUser; error?: string; status?: number } {
  const token = getTokenFromRequest(req);

  if (!token) {
    return { authenticated: false, error: 'Unauthorized', status: 401 };
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ['HS256'],
      audience: 'whiskedelights-admin',
      issuer: 'whiskedelights',
    }) as AuthUser;

    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method.toUpperCase());
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    const allowedOrigins = getAllowedOrigins();

    if (isMutation) {
      if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
        return { authenticated: false, error: 'Server origin policy is not configured', status: 500 };
      }

      if (allowedOrigins.length > 0 && !isAllowedOrigin(origin)) {
        return { authenticated: false, error: 'Forbidden origin', status: 403 };
      }
    }

    if (options.requireAdmin && decoded.role !== 'admin') {
      return { authenticated: false, error: 'Forbidden', status: 403 };
    }

    return { authenticated: true, user: decoded };
  } catch {
    return { authenticated: false, error: 'Session expired', status: 401 };
  }
}

export function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}
