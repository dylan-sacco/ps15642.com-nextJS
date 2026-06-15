import { NextResponse } from 'next/server';
import { requireApiPermission } from '@/lib/adminAuth';
import { getPairs, addPair, updatePair, deletePair } from '@/lib/beforeAfter';

export async function GET() {
  const { error } = await requireApiPermission('beforeafter.view');
  if (error) return error;
  return NextResponse.json({ pairs: getPairs() });
}

export async function POST(request) {
  const { error } = await requireApiPermission('beforeafter.manage');
  if (error) return error;
  const data = await request.json();
  if (!data.beforeImage || !data.afterImage) {
    return NextResponse.json({ error: 'Both before and after images are required' }, { status: 400 });
  }
  const entry = addPair(data);
  return NextResponse.json({ success: true, pair: entry });
}

export async function PUT(request) {
  const { error } = await requireApiPermission('beforeafter.manage');
  if (error) return error;
  const { id, ...data } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const ok = updatePair(id, data);
  if (!ok) return NextResponse.json({ error: 'Pair not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { error } = await requireApiPermission('beforeafter.manage');
  if (error) return error;
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const ok = deletePair(id);
  if (!ok) return NextResponse.json({ error: 'Pair not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
