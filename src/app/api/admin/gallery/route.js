import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GALLERY_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

export async function GET() {
  const { error } = await requireApiPermission('gallery.view');
  if (error) return error;

  try {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
    const files = fs.readdirSync(GALLERY_DIR);
    const imageFiles = files.filter(name => /\.(jpe?g|png|webp|gif)$/i.test(name));

    let order = [];
    try {
      order = JSON.parse(fs.readFileSync(path.join(GALLERY_DIR, '_order.json'), 'utf8'));
    } catch { /* no order file */ }

    let disabled = new Set();
    try {
      disabled = new Set(JSON.parse(fs.readFileSync(path.join(GALLERY_DIR, '_disabled.json'), 'utf8')));
    } catch { /* no disabled file */ }

    let sorted;
    if (order.length > 0) {
      const orderSet = new Set(order);
      const ordered = order.filter(name => imageFiles.includes(name));
      const remaining = imageFiles.filter(name => !orderSet.has(name)).sort();
      sorted = [...ordered, ...remaining];
    } else {
      sorted = [...imageFiles].sort();
    }

    const images = sorted
      .filter(name => !disabled.has(name))
      .map(name => ({ filename: name, url: `/api/images/${name.replace(/\.[^.]+$/, '')}` }));

    return NextResponse.json({ images });
  } catch (err) {
    console.error('Gallery list error:', err);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}
