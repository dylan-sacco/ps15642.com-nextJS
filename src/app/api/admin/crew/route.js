import { NextResponse } from 'next/server';
import { requireApiPermission } from '@/lib/adminAuth';
import { readCrew, writeCrew } from '@/lib/crew';

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// GET /api/admin/crew — return full crew data
export async function GET() {
  const { error } = await requireApiPermission('crew.view');
  if (error) return error;

  return NextResponse.json(readCrew());
}

// POST /api/admin/crew — add a new member
export async function POST(request) {
  const { error } = await requireApiPermission('crew.manage');
  if (error) return error;

  const body = await request.json();
  if (!body.name?.trim() || !body.title?.trim()) {
    return NextResponse.json({ error: 'Name and title are required' }, { status: 400 });
  }

  const member = {
    id:          makeId(),
    name:        body.name.trim(),
    title:       body.title.trim(),
    image:       body.image || '',
    description: body.description || '',
    phone:       body.phone || '',
    email:       body.email || '',
    visible:     body.visible ?? true,
  };

  const crew = readCrew();
  crew.members.push(member);
  writeCrew(crew);

  return NextResponse.json({ success: true, member });
}

// PUT /api/admin/crew — update member, toggle sectionVisible, or reorder
export async function PUT(request) {
  const { error } = await requireApiPermission('crew.manage');
  if (error) return error;

  const body = await request.json();

  // Update root settings: { sectionVisible?, title?, subtitle? }
  if (!body.id && !Array.isArray(body.reorder)) {
    const crew = readCrew();
    if ('sectionVisible' in body) crew.sectionVisible = Boolean(body.sectionVisible);
    if ('title'          in body) crew.title          = String(body.title ?? '');
    if ('subtitle'       in body) crew.subtitle       = String(body.subtitle ?? '');
    writeCrew(crew);
    return NextResponse.json({ success: true });
  }

  // Reorder: { reorder: ['id1', 'id2', ...] }
  if (Array.isArray(body.reorder)) {
    const crew = readCrew();
    const map = Object.fromEntries(crew.members.map(m => [m.id, m]));
    crew.members = body.reorder.map(id => map[id]).filter(Boolean);
    writeCrew(crew);
    return NextResponse.json({ success: true });
  }

  // Update a member: { id, ...fields }
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const crew = readCrew();
  const idx = crew.members.findIndex(m => m.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

  crew.members[idx] = { ...crew.members[idx], ...fields };
  writeCrew(crew);

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/crew — remove a member
export async function DELETE(request) {
  const { error } = await requireApiPermission('crew.manage');
  if (error) return error;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const crew = readCrew();
  const before = crew.members.length;
  crew.members = crew.members.filter(m => m.id !== id);
  if (crew.members.length === before) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 });
  }

  writeCrew(crew);
  return NextResponse.json({ success: true });
}
