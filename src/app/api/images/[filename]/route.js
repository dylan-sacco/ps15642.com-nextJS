import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GALLERY_DIR } from '@/lib/paths';

export const dynamic = 'force-dynamic';

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
    const stats = fs.statSync(filePath);
    const etag = `"${stats.mtime.getTime()}-${stats.size}"`;
    const lastModified = stats.mtime.toUTCString();

    // Respond 304 if client already has the current version
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new Response(null, { status: 304 });
    }
    const ifModifiedSince = request.headers.get('if-modified-since');
    if (ifModifiedSince && new Date(ifModifiedSince) >= stats.mtime) {
      return new Response(null, { status: 304 });
    }

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
        'Cache-Control': 'no-cache',
        'ETag': etag,
        'Last-Modified': lastModified,
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Error serving image' }, { status: 500 });
  }
}
