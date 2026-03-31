import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GALLERY_DIR } from '@/lib/paths';

export async function GET(request, { params }) {
  const { filename } = await params;
  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Sanitize filename to prevent directory traversal
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');

  // Resolve path — if no extension provided, search for any matching image file
  let resolvedFilename = safeFilename;
  let filePath = path.join(GALLERY_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    // Try appending common image extensions
    const exts = ['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg'];
    const hasExt = path.extname(safeFilename) !== '';
    if (!hasExt) {
      for (const ext of exts) {
        const candidate = path.join(GALLERY_DIR, safeFilename + ext);
        if (fs.existsSync(candidate)) {
          resolvedFilename = safeFilename + ext;
          filePath = candidate;
          break;
        }
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(resolvedFilename).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Error serving image' }, { status: 500 });
  }
}
