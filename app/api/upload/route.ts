
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

/**
 * @fileOverview Secure Media Upload API
 * Returns a URL that points to the internal Media API for consistent rendering.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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
