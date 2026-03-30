import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GALLERY_DIR } from '@/lib/paths';

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

    if (fs.existsSync(newPath)) {
      return NextResponse.json({ error: `File already exists: ${newName}` }, { status: 409 });
    }

    fs.renameSync(oldPath, newPath);

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
