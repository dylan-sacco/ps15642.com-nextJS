import { NextResponse } from 'next/server';
import { requireApiPermission } from '@/lib/adminAuth';
import { getSubmissions, markRead, deleteSubmission } from '@/lib/contactSubmissions';

// GET /api/admin/contact — list all submissions
export async function GET() {
  const { error } = await requireApiPermission('contact.view');
  if (error) return error;

  const submissions = getSubmissions();
  return NextResponse.json({ submissions });
}

// PATCH /api/admin/contact — mark a submission as read
// Body: { id }
export async function PATCH(request) {
  const { error } = await requireApiPermission('contact.view');
  if (error) return error;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const ok = markRead(id);
  if (!ok) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/contact — delete a submission
// Body: { id }
export async function DELETE(request) {
  const { error } = await requireApiPermission('contact.delete');
  if (error) return error;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const ok = deleteSubmission(id);
  if (!ok) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
