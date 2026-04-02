import { NextResponse } from 'next/server';
import fs from 'fs';
import { requireApiPermission } from '@/lib/adminAuth';
import { GALLERY_ALT_FILE } from '@/lib/paths';

function readAlt() {
  try { return JSON.parse(fs.readFileSync(GALLERY_ALT_FILE, 'utf8')); } catch { return {}; }
}

function writeAlt(alt) {
  fs.writeFileSync(GALLERY_ALT_FILE, JSON.stringify(alt, null, 2), 'utf8');
}

// PATCH /api/admin/gallery/alt — { filename, alt }
export async function PATCH(request) {
  const { error } = await requireApiPermission('gallery.edit');
  if (error) return error;

  const { filename, alt } = await request.json();
  if (!filename) return NextResponse.json({ error: 'Missing filename' }, { status: 400 });

  const data = readAlt();
  if (alt) {
    data[filename] = alt;
  } else {
    delete data[filename];
  }
  writeAlt(data);

  return NextResponse.json({ success: true });
}
