import { NextResponse } from 'next/server';
import { requireApiPermission } from '@/lib/adminAuth';
import { getBannerSettings, updateBannerSettings } from '@/lib/banners';

export async function GET() {
  const { error } = await requireApiPermission('banners.view');
  if (error) return error;
  return NextResponse.json(getBannerSettings());
}

export async function PATCH(request) {
  const { error } = await requireApiPermission('banners.manage');
  if (error) return error;
  const data = await request.json();
  const updated = updateBannerSettings(data);
  return NextResponse.json(updated);
}
