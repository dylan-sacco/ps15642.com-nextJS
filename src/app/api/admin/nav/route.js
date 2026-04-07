import { NextResponse } from 'next/server';
import fs from 'fs';
import { NAV_FILE } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

function validateItems(items) {
  if (!Array.isArray(items)) return false;
  return items.every(item =>
    typeof item.name === 'string' && item.name.trim() &&
    typeof item.href === 'string' && item.href.trim() &&
    (!item.dropdown || (
      Array.isArray(item.dropdown) &&
      item.dropdown.every(d => typeof d.name === 'string' && typeof d.href === 'string')
    ))
  );
}

export async function GET() {
  const { error } = await requireApiPermission('nav.manage');
  if (error) return error;

  try {
    const items = JSON.parse(fs.readFileSync(NAV_FILE, 'utf8'));
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}

export async function PUT(request) {
  const { error } = await requireApiPermission('nav.manage');
  if (error) return error;

  try {
    const items = await request.json();
    if (!validateItems(items)) {
      return NextResponse.json({ error: 'Invalid nav structure' }, { status: 400 });
    }
    fs.writeFileSync(NAV_FILE, JSON.stringify(items, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Nav save error:', err);
    return NextResponse.json({ error: 'Failed to save navigation' }, { status: 500 });
  }
}
