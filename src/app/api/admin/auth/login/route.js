import { NextResponse } from 'next/server';
import { readUsers, verifyPassword, signToken, makeAuthCookieHeader } from '@/lib/auth';

export async function POST(request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
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

  const users = readUsers();

  // Always run verifyPassword even if user not found to prevent timing attacks
  const user = users.find(u => u.username === username);
  const dummyHash = 'deadbeef:deadbeef';
  const valid = user
    ? verifyPassword(password, user.passwordHash)
    : verifyPassword(password, dummyHash);

  if (!valid || !user) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const token = signToken(username, user.role ?? 'editor', secret);

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        'Set-Cookie': makeAuthCookieHeader(token),
      },
    }
  );
}
