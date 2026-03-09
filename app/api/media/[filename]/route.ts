
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Secure Media Serving API
 * Next.js 15 requires awaiting params.
 */
export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    
    // Sanitize to prevent directory traversal
    const safeFilename = filename.split('/').pop() || '';
    const filePath = join(process.cwd(), 'public', 'uploads', safeFilename);
    
    const data = await readFile(filePath);
    
    const ext = safeFilename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'gif': 'image/gif'
    };
    
    const contentType = mimeTypes[ext || ''] || 'application/octet-stream';

    return new NextResponse(data, {
      headers: { 
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
    });
  } catch (e) {
    console.error('Media Access Failed:', e);
    return new NextResponse(null, { status: 404 });
  }
}
