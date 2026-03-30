import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GALLERY_DIR } from '@/lib/paths';

function readDisabled() {
  try {
    return JSON.parse(fs.readFileSync(path.join(GALLERY_DIR, '_disabled.json'), 'utf8'));
  } catch {
    return [];
  }
}

function writeDisabled(list) {
  fs.writeFileSync(path.join(GALLERY_DIR, '_disabled.json'), JSON.stringify(list, null, 2), 'utf8');
}

export async function PATCH(request) {
  try {
    const { filename, disabled } = await request.json();

    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(GALLERY_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: `File not found: ${filename}` }, { status: 404 });
    }

    const current = readDisabled();

    const updated = disabled
      ? [...new Set([...current, filename])]          // add if not already there
      : current.filter(name => name !== filename);    // remove

    writeDisabled(updated);
    return NextResponse.json({ success: true, disabled: updated.includes(filename) });
  } catch (err) {
    console.error('Gallery disable error:', err);
    return NextResponse.json({ error: 'Failed to update visibility' }, { status: 500 });
  }
}
