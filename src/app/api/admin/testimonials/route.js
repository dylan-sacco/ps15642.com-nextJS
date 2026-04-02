import { NextResponse } from 'next/server';
import { requireApiPermission } from '@/lib/adminAuth';
import { getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial } from '@/lib/testimonials';

// GET /api/admin/testimonials — list all
export async function GET() {
  const { error } = await requireApiPermission('testimonials.view');
  if (error) return error;

  return NextResponse.json({ testimonials: getTestimonials() });
}

// POST /api/admin/testimonials — create
export async function POST(request) {
  const { error } = await requireApiPermission('testimonials.manage');
  if (error) return error;

  const data = await request.json();
  if (!data.name || !data.text) {
    return NextResponse.json({ error: 'Name and text are required' }, { status: 400 });
  }

  const entry = addTestimonial(data);
  return NextResponse.json({ success: true, testimonial: entry });
}

// PUT /api/admin/testimonials — update
export async function PUT(request) {
  const { error } = await requireApiPermission('testimonials.manage');
  if (error) return error;

  const { id, ...data } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const ok = updateTestimonial(id, data);
  if (!ok) return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/testimonials — delete
export async function DELETE(request) {
  const { error } = await requireApiPermission('testimonials.manage');
  if (error) return error;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const ok = deleteTestimonial(id);
  if (!ok) return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });

  return NextResponse.json({ success: true });
}
