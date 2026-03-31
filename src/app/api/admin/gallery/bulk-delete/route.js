import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GALLERY_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return []; }
}
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function DELETE(request) {
  const { error } = await requireApiPermission('gallery.delete');
  if (error) return error;

  try {
    const { filenames } = await request.json();

    if (!Array.isArray(filenames) || filenames.length === 0) {
      return NextResponse.json({ error: 'filenames array required' }, { status: 400 });
    }

    for (const name of filenames) {
      if (typeof name !== 'string' || name.includes('..') || name.includes('/') || name.includes('\\')) {
        return NextResponse.json({ error: `Invalid filename: ${name}` }, { status: 400 });
      }
    }

    const deleted = [];
    for (const name of filenames) {
      const filePath = path.join(GALLERY_DIR, name);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        deleted.push(name);
      }
    }

    const toRemove = new Set(filenames);

    const orderPath = path.join(GALLERY_DIR, '_order.json');
    const order = readJson(orderPath);
    writeJson(orderPath, order.filter(n => !toRemove.has(n)));

    const disabledPath = path.join(GALLERY_DIR, '_disabled.json');
    const disabled = readJson(disabledPath);
    writeJson(disabledPath, disabled.filter(n => !toRemove.has(n)));

    return NextResponse.json({ success: true, deleted });
  } catch (err) {
    console.error('Gallery bulk-delete error:', err);
    return NextResponse.json({ error: 'Bulk delete failed' }, { status: 500 });
  }
}
