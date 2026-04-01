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

export async function PATCH(request) {
  const { error } = await requireApiPermission('gallery.edit');
  if (error) return error;

  try {
    const { oldName, newName } = await request.json();

    if (!oldName || !newName) {
      return NextResponse.json({ error: 'oldName and newName required' }, { status: 400 });
    }

    for (const name of [oldName, newName]) {
      if (name.includes('..') || name.includes('/') || name.includes('\\')) {
        return NextResponse.json({ error: `Invalid filename: ${name}` }, { status: 400 });
      }
    }

    const oldPath = path.join(GALLERY_DIR, oldName);
    const newPath = path.join(GALLERY_DIR, newName);

    if (!fs.existsSync(oldPath)) {
      return NextResponse.json({ error: `File not found: ${oldName}` }, { status: 404 });
    }

    // Reject if exact file exists
    if (fs.existsSync(newPath)) {
      return NextResponse.json({ error: `A file named "${newName}" already exists.` }, { status: 409 });
    }

    // Reject if another file shares the same basename (different extension) — basenames
    // must be unique because /api/uploads/{base} serves by name without extension.
    const newBase = path.parse(newName).name.toLowerCase();
    const oldBase = path.parse(oldName).name.toLowerCase();
    if (newBase !== oldBase) {
      const conflict = fs.readdirSync(GALLERY_DIR).find(f =>
        f !== oldName &&
        !f.endsWith('.thumb.webp') &&
        /\.(jpe?g|png|webp|gif|mp4|mov|webm)$/i.test(f) &&
        path.parse(f).name.toLowerCase() === newBase
      );
      if (conflict) {
        return NextResponse.json(
          { error: `"${newBase}" is already used by "${conflict}". Each file must have a unique name.` },
          { status: 409 }
        );
      }
    }

    fs.renameSync(oldPath, newPath);

    // Also rename the video thumbnail if it exists
    if (/\.(mp4|mov|webm)$/i.test(oldName)) {
      const oldThumb = path.join(GALLERY_DIR, `${path.parse(oldName).name}.thumb.webp`);
      const newThumb = path.join(GALLERY_DIR, `${path.parse(newName).name}.thumb.webp`);
      if (fs.existsSync(oldThumb)) {
        try { fs.renameSync(oldThumb, newThumb); } catch { /* best-effort */ }
      }
    }

    // Update order
    const order = readOrder();
    const idx = order.indexOf(oldName);
    if (idx !== -1) {
      order[idx] = newName;
      writeOrder(order);
    }

    return NextResponse.json({ success: true, newName });
  } catch (err) {
    console.error('Gallery rename error:', err);
    return NextResponse.json({ error: 'Rename failed' }, { status: 500 });
  }
}
