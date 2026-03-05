
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

/**
 * Dynamic Media Server
 * Solves the issue where files written to /public are not visible until restart.
 * It reads directly from the filesystem at runtime.
 */
export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    // Sanitize filename to prevent directory traversal
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
    console.error('Media Server Error:', e);
    return new NextResponse(null, { status: 404 });
  }
}
