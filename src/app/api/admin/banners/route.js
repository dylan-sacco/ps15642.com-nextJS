import { NextResponse } from 'next/server';
import { requireApiPermission } from '@/lib/adminAuth';
import { getBanners, addBanner } from '@/lib/banners';

export async function GET() {
  const { error } = await requireApiPermission('banners.view');
  if (error) return error;
  return NextResponse.json({ banners: getBanners() });
}

export async function POST(request) {
  const { error } = await requireApiPermission('banners.manage');
  if (error) return error;
  const data = await request.json();
  if (!data.content && data.type !== 'contact') {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 });
  }
  const entry = addBanner(data);
  return NextResponse.json({ success: true, banner: entry });
}
