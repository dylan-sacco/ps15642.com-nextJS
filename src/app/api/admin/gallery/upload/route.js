import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GALLERY_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^[-.]/, '')
    .toLowerCase();
}

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

export async function POST(request) {
  const { error } = await requireApiPermission('gallery.upload');
  if (error) return error;

  try {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });

    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploaded = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { error: `File type .${ext} not allowed` },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json(
          { error: `MIME type ${file.type} not allowed` },
          { status: 400 }
        );
      }

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds 20 MB limit` },
          { status: 400 }
        );
      }

      const safeName = sanitizeFilename(file.name);
      const destPath = path.join(GALLERY_DIR, safeName);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(destPath, buffer);
      uploaded.push(safeName);
    }

    // Append to order
    const order = readOrder();
    for (const name of uploaded) {
      if (!order.includes(name)) order.push(name);
    }
    writeOrder(order);

    return NextResponse.json({ uploaded }, { status: 201 });
  } catch (err) {
    console.error('Gallery upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
