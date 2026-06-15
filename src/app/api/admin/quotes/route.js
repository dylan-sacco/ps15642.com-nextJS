import { NextResponse } from 'next/server';
import { requireApiPermission } from '@/lib/adminAuth';
import { getQuotes, markQuoteRead, deleteQuote } from '@/lib/quoteRequests';

export async function GET() {
  const { error } = await requireApiPermission('quotes.view');
  if (error) return error;
  return NextResponse.json({ quotes: getQuotes() });
}

export async function PATCH(request) {
  const { error } = await requireApiPermission('quotes.view');
  if (error) return error;
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const ok = markQuoteRead(id);
  if (!ok) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request) {
  const { error } = await requireApiPermission('quotes.delete');
  if (error) return error;
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const ok = deleteQuote(id);
  if (!ok) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
