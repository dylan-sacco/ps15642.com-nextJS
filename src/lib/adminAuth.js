// Server-side auth helper — Node.js runtime only (do NOT import in middleware).
// Use getSessionUser() in pages, requireApiPermission() in API route handlers.

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { hasPermission } from '@/lib/permissions';

// Decodes the admin_auth cookie and returns { username, role, exp }, or null.
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_auth')?.value;
    if (!token) return null;
    const [payload] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!decoded.exp || decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}

// For API routes: returns { user } on success, or { error: NextResponse } on failure.
// Usage:
//   const { user, error } = await requireApiPermission('gallery.upload');
//   if (error) return error;
export async function requireApiPermission(permission) {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }),
    };
  }
  if (!hasPermission(user.role, permission)) {
    return {
      error: NextResponse.json(
        { error: `Your role does not have permission: ${permission}` },
        { status: 403 }
      ),
    };
  }
  return { user };
}
