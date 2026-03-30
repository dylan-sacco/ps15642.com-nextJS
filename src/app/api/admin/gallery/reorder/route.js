import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GALLERY_DIR } from '@/lib/paths';

export async function POST(request) {
  try {
    const { order } = await request.json();

    if (!Array.isArray(order)) {
      return NextResponse.json({ error: 'order must be an array' }, { status: 400 });
    }

    // Validate all filenames exist on disk
    for (const name of order) {
      if (typeof name !== 'string' || name.includes('..') || name.includes('/')) {
        return NextResponse.json({ error: `Invalid filename: ${name}` }, { status: 400 });
      }
      const filePath = path.join(GALLERY_DIR, name);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: `File not found: ${name}` }, { status: 400 });
      }
    }

    const orderPath = path.join(GALLERY_DIR, '_order.json');
    fs.writeFileSync(orderPath, JSON.stringify(order, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Gallery reorder error:', err);
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
  }
}
