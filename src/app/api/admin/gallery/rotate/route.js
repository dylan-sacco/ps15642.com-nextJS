import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GALLERY_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

export async function POST(request) {
  const { error } = await requireApiPermission('gallery.edit');
  if (error) return error;

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

    const ext = path.extname(filename).toLowerCase().slice(1); // 'jpg', 'png', 'webp', 'gif'
    const format = ext === 'jpg' ? 'jpeg' : ext;

    // Read into buffer first to avoid Windows file-lock issues
    const inputBuffer = fs.readFileSync(filePath);
    const rotated = await sharp(inputBuffer)
      .rotate(90)
      .toFormat(format)
      .toBuffer();

    fs.writeFileSync(filePath, rotated);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Gallery rotate error:', err);
    return NextResponse.json({ error: err.message || 'Rotation failed' }, { status: 500 });
  }
}
