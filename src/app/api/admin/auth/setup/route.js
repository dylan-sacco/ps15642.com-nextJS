import { NextResponse } from 'next/server';
import { readUsers, writeUsers, hashPassword } from '@/lib/auth';
import { SETUP_ROLE } from '@/config/roles';

// One-time setup endpoint — creates the first admin user.
// Only works when no users exist. Middleware restricts this to local IPs.
export async function POST(request) {
  const existing = readUsers();
  if (existing.length > 0) {
    return NextResponse.json(
      { error: 'Setup already complete. Use /admin/users to manage accounts.' },
      { status: 409 }
    );
  }

  let username, password;
  try {
    ({ username, password } = await request.json());
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

  writeUsers([{ username, role: SETUP_ROLE, passwordHash: hashPassword(password) }]);
  return NextResponse.json({ ok: true, message: `User "${username}" created. You can now log in.` });
}
