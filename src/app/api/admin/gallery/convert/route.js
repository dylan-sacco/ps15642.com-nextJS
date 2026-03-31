import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { GALLERY_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

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

    const ext = path.extname(filename).toLowerCase();

    if (ext === '.webp') {
      return NextResponse.json({ error: 'Already a WebP image' }, { status: 400 });
    }

    if (!['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

    const oldPath = path.join(GALLERY_DIR, filename);
    if (!fs.existsSync(oldPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const basename = path.basename(filename, ext);
    const newFilename = basename + '.webp';
    const newPath = path.join(GALLERY_DIR, newFilename);

    if (fs.existsSync(newPath)) {
      return NextResponse.json({ error: `${newFilename} already exists` }, { status: 409 });
    }

    // Convert to WebP
    await sharp(oldPath).webp({ quality: 85 }).toFile(newPath);

    // Remove old file
    fs.unlinkSync(oldPath);

    // Update _order.json
    const orderPath = path.join(GALLERY_DIR, '_order.json');
    const order = readJson(orderPath);
    if (Array.isArray(order)) {
      const idx = order.indexOf(filename);
      if (idx !== -1) order[idx] = newFilename;
      writeJson(orderPath, order);
    }

    // Update _disabled.json
    const disabledPath = path.join(GALLERY_DIR, '_disabled.json');
    const disabled = readJson(disabledPath);
    if (Array.isArray(disabled)) {
      const idx = disabled.indexOf(filename);
      if (idx !== -1) {
        disabled[idx] = newFilename;
        writeJson(disabledPath, disabled);
      }
    }

    return NextResponse.json({ success: true, newFilename });
  } catch (err) {
    console.error('Gallery convert error:', err);
    return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
  }
}
