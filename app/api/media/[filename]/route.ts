
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Secure Media Serving API
 * Correctly awaits params for Next.js 15 compatibility.
 */
export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    
    // Sanitize path to prevent directory traversal
    const safeFilename = filename.split('/').pop() || '';
    const filePath = join(process.cwd(), 'public', 'uploads', safeFilename);
    
    const data = await readFile(filePath);
    
    const ext = safeFilename.split('.').pop()?.toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : (ext === 'webp' ? 'image/webp' : 'image/jpeg');

    return new NextResponse(data, {
      headers: { 
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
    });
  } catch (e) {
    console.error('Media fetch error:', e);
    return new NextResponse(null, { status: 404 });
  }
}
