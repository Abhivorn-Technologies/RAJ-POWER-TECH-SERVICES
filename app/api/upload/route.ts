import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/server-guard';
import { promises as fs } from 'fs';
import path from 'path';

export const instant = false;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/gif',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required to upload assets' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const mime = file.type?.toLowerCase() || '';
    if (!ALLOWED_MIME_TYPES.has(mime)) {
      return NextResponse.json(
        { error: `Unsupported file format. Please upload a PNG, JPG, JPEG, WEBP, or SVG image.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum limit of 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let ext = path.extname(file.name).toLowerCase();
    if (!ext || ext === '.') {
      if (mime === 'image/jpeg') ext = '.jpg';
      else if (mime === 'image/webp') ext = '.webp';
      else if (mime === 'image/svg+xml') ext = '.svg';
      else ext = '.png';
    }

    const cleanBaseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 30);
    const fileName = `${Date.now()}-${cleanBaseName || 'asset'}${ext}`;

    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/${fileName}`,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    } catch (fsError) {
      console.warn('Filesystem write failed, falling back to data URI:', fsError);
      // Fallback for read-only serverless environments
      const base64Data = buffer.toString('base64');
      const dataUri = `data:${mime};base64,${base64Data}`;
      return NextResponse.json({
        success: true,
        url: dataUri,
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error processing file upload' },
      { status: 500 }
    );
  }
}
