import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp, verifyAuth } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

/**
 * @fileOverview Secure Media Upload API
 * Returns a URL that points to the internal Media API for consistent rendering.
 */
export async function POST(req: NextRequest) {
  const auth = verifyAuth(req, { requireAdmin: true });
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const rateLimit = checkRateLimit({
      key: `admin:upload:${getClientIp(req)}`,
      limit: 10,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many uploads' }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Standardize upload path
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Generate safe filename
    const timestamp = Date.now();
    const safeFilename = `${timestamp}-${file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
    const path = join(uploadDir, safeFilename);
    
    await writeFile(path, buffer);
    
    // Return URL pointing to the Media API to ensure correct rendering
    const url = `/api/media/${safeFilename}`;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('[MEDIA_UPLOAD_API_ERROR]', error);
    return NextResponse.json({ error: "Storage write failed" }, { status: 500 });
  }
}
