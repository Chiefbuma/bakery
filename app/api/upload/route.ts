
import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Sanitize filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()}`;
    const path = join(uploadDir, filename);
    
    await writeFile(path, buffer);
    
    // Return path for database storage
    const url = `/uploads/${filename}`;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Media Upload Error:', error);
    return NextResponse.json({ error: "Storage write failed" }, { status: 500 });
  }
}
