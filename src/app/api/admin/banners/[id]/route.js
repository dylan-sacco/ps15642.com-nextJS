import { NextResponse } from 'next/server';
import { requireApiPermission } from '@/lib/adminAuth';
import { updateBanner, deleteBanner } from '@/lib/banners';

export async function PUT(request, { params }) {
  const { error } = await requireApiPermission('banners.manage');
  if (error) return error;
  const { id } = await params;
  const data = await request.json();
  const ok = updateBanner(id, data);
  if (!ok) return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request, { params }) {
  const { error } = await requireApiPermission('banners.manage');
  if (error) return error;
  const { id } = await params;
  const result = deleteBanner(id);
  if (!result.ok) {
    if (result.reason === 'permanent') {
      return NextResponse.json({ error: 'This banner is permanent and cannot be deleted.' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
