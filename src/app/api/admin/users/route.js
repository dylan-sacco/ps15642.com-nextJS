import { NextResponse } from 'next/server';
import { readUsers, writeUsers, hashPassword } from '@/lib/auth';
import { ROLES, DEFAULT_ROLE } from '@/config/roles';
import { canManageRole } from '@/lib/permissions';
import { cookies } from 'next/headers';

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_auth')?.value;
    if (!token) return null;
    const [payload] = token.split('.');
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
}

export async function GET() {
  const users = readUsers();
  return NextResponse.json(users.map(u => ({ username: u.username, role: u.role ?? DEFAULT_ROLE })));
}

export async function POST(request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let username, password, role;
  try {
    ({ username, password, role } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return NextResponse.json(
      { error: 'Username must be 3–20 alphanumeric characters or underscores' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const assignedRole = role || DEFAULT_ROLE;

  if (!ROLES[assignedRole]) {
    return NextResponse.json({ error: `Unknown role "${assignedRole}"` }, { status: 400 });
  }

  if (!canManageRole(currentUser.role, assignedRole)) {
    return NextResponse.json(
      { error: `Your role cannot create users with role "${ROLES[assignedRole].label}"` },
      { status: 403 }
    );
  }

  const users = readUsers();
  if (users.some(u => u.username === username)) {
    return NextResponse.json({ error: `Username "${username}" is already taken` }, { status: 409 });
  }

  users.push({ username, role: assignedRole, passwordHash: hashPassword(password) });
  writeUsers(users);
  return NextResponse.json({ ok: true, username, role: assignedRole });
}

export async function DELETE(request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let username;
  try {
    ({ username } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  if (username === currentUser.username) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const users = readUsers();
  const target = users.find(u => u.username === username);

  if (!target) {
    return NextResponse.json({ error: `User "${username}" not found` }, { status: 404 });
  }

  if (!canManageRole(currentUser.role, target.role ?? DEFAULT_ROLE)) {
    return NextResponse.json(
      { error: `Your role cannot delete users with role "${ROLES[target.role]?.label ?? target.role}"` },
      { status: 403 }
    );
  }

  if (users.length <= 1) {
    return NextResponse.json({ error: 'Cannot delete the last user account' }, { status: 400 });
  }

  writeUsers(users.filter(u => u.username !== username));
  return NextResponse.json({ ok: true });
}
