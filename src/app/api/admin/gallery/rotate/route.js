import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GALLERY_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

export async function POST(request) {
  const { error } = await requireApiPermission('gallery.edit');
  if (error) return error;

  let tmpPath = null;

  try {
    const { filename } = await request.json();

    if (!filename) {
      return NextResponse.json({ error: 'filename required' }, { status: 400 });
    }

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(GALLERY_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase().slice(1);
    const format = ext === 'jpg' ? 'jpeg' : ext;

    // Write to a temp file first, then rename — avoids loading the whole image
    // into memory at once (prevents OOM crashes on large iPhone photos)
    tmpPath = filePath + '.tmp';

    sharp.cache(false);
    sharp.concurrency(1);

    await sharp(filePath)
      .rotate(90)
      .toFormat(format)
      .toFile(tmpPath);

    fs.renameSync(tmpPath, filePath);
    tmpPath = null;

    const mtime = Math.floor(fs.statSync(filePath).mtimeMs / 1000);
    return NextResponse.json({ success: true, mtime });
  } catch (err) {
    // Clean up temp file if something went wrong
    if (tmpPath) {
      try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
    }
    console.error('Gallery rotate error:', err);
    return NextResponse.json({ error: err.message || 'Rotation failed' }, { status: 500 });
  }
}
