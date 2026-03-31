import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth.authenticated || !auth.user) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  return NextResponse.json({
    user: {
      id: auth.user.id,
      name: auth.user.name,
      email: auth.user.email,
      role: auth.user.role,
    },
  });
}
