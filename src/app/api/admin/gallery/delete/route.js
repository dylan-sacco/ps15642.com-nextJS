import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GALLERY_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

function readOrder() {
  const orderPath = path.join(GALLERY_DIR, '_order.json');
  try {
    return JSON.parse(fs.readFileSync(orderPath, 'utf8'));
  } catch {
    return [];
  }
}

function writeOrder(order) {
  const orderPath = path.join(GALLERY_DIR, '_order.json');
  fs.writeFileSync(orderPath, JSON.stringify(order, null, 2), 'utf8');
}

export async function DELETE(request) {
  const { error } = await requireApiPermission('gallery.delete');
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
      return NextResponse.json({ error: `File not found: ${filename}` }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    // Also delete the video thumbnail if it exists
    if (/\.(mp4|mov|webm)$/i.test(filename)) {
      const thumbPath = path.join(GALLERY_DIR, `${path.parse(filename).name}.thumb.webp`);
      try { if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath); } catch { /* best-effort */ }
    }

    // Remove from order
    const order = readOrder().filter(name => name !== filename);
    writeOrder(order);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Gallery delete error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
