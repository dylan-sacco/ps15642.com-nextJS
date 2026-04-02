import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { GALLERY_DIR } from '@/lib/paths';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { filename } = await params;
  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Sanitize filename to prevent directory traversal
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');

  // Resolve path — if no extension provided, search for any matching file
  let resolvedFilename = safeFilename;
  let filePath = path.join(GALLERY_DIR, safeFilename);

  if (!fs.existsSync(filePath)) {
    const exts = ['.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.mp4', '.webm', '.mov'];
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
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  try {
    const ext = path.extname(resolvedFilename).toLowerCase();

    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png')  contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif')  contentType = 'image/gif';
    else if (ext === '.svg')  contentType = 'image/svg+xml';
    else if (ext === '.mp4')  contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.mov')  contentType = 'video/quicktime';

    const isVideo = ['.mp4', '.webm', '.mov'].includes(ext);
    const cacheControl = isVideo ? 'public, max-age=604800' : 'public, max-age=3600';

    // Images: serve full file (no range needed)
    if (!isVideo) {
      const buffer = fs.readFileSync(filePath);
      return new Response(buffer, {
        headers: { 'Content-Type': contentType, 'Cache-Control': cacheControl },
      });
    }

    // Videos: support HTTP Range requests (required for iOS Safari)
    const { size: fileSize } = fs.statSync(filePath);
    const rangeHeader = request.headers.get('range');

    if (!rangeHeader) {
      // No Range header — stream full file but advertise range support
      return new Response(Readable.toWeb(fs.createReadStream(filePath)), {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(fileSize),
          'Accept-Ranges': 'bytes',
          'Cache-Control': cacheControl,
        },
      });
    }

    // Parse "bytes=start-end"
    const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
    if (!match || (match[1] === '' && match[2] === '')) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${fileSize}` },
      });
    }

    let start, end;
    if (match[1] === '') {
      // Suffix range: bytes=-N (last N bytes)
      start = Math.max(0, fileSize - parseInt(match[2], 10));
      end = fileSize - 1;
    } else {
      start = parseInt(match[1], 10);
      end = match[2] !== '' ? parseInt(match[2], 10) : fileSize - 1;
      end = Math.min(end, fileSize - 1); // clamp per RFC 9110
    }

    if (isNaN(start) || isNaN(end) || start < 0 || start > end) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${fileSize}` },
      });
    }

    const chunkSize = end - start + 1;
    return new Response(Readable.toWeb(fs.createReadStream(filePath, { start, end })), {
      status: 206,
      headers: {
        'Content-Type': contentType,
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': String(chunkSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': cacheControl,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Error serving file' }, { status: 500 });
  }
}
