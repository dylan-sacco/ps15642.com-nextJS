import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

const BYPASS_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// GET /api/admin/auth/bypass?t=<token>
//
// Grants IP-independent admin access for the next 24 hours by setting a signed
// admin_bypass cookie. Designed for access from cellular / dynamic IPs where
// whitelisting a specific IP isn't practical.
//
// Usage:
//   Bookmark: https://your-domain.com/api/admin/auth/bypass?t=YOUR_BYPASS_TOKEN
//   Visit the bookmark from any device/network → get the cookie → log in normally.
//
// Security:
//   - Requires ADMIN_BYPASS_TOKEN to be set in your .env
//   - Uses timing-safe comparison to prevent token enumeration
//   - The resulting cookie is signed with ADMIN_SECRET and expires in 24 hours
//   - The token never appears in a rendered page (only in a redirect response)
//
export async function GET(request) {
  const bypassToken = process.env.ADMIN_BYPASS_TOKEN;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!bypassToken || !adminSecret) {
    return new NextResponse(
      'Bypass token not configured. Set ADMIN_BYPASS_TOKEN and ADMIN_SECRET in your .env.',
      { status: 503, headers: { 'Content-Type': 'text/plain' } }
    );
  }

  const provided = new URL(request.url).searchParams.get('t') ?? '';

  // Timing-safe comparison — pad both to the same length so timingSafeEqual
  // doesn't throw on mismatched lengths, then separately check actual length equality.
  let valid = false;
  try {
    const maxLen = Math.max(provided.length, bypassToken.length);
    valid =
      provided.length === bypassToken.length &&
      crypto.timingSafeEqual(
        Buffer.from(provided.padEnd(maxLen, '\0')),
        Buffer.from(bypassToken.padEnd(maxLen, '\0'))
      );
  } catch {
    valid = false;
  }

  if (!valid) {
    return new NextResponse('Invalid bypass token.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Sign the bypass cookie: "<exp>:<hmac>"
  const exp = Date.now() + BYPASS_EXPIRY_MS;
  const sig = crypto
    .createHmac('sha256', adminSecret)
    .update(`bypass:${exp}`)
    .digest('base64url');
  const cookieValue = `${exp}:${sig}`;

  const maxAge = Math.floor(BYPASS_EXPIRY_MS / 1000);
  const cookieHeader = [
    `admin_bypass=${cookieValue}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
  ].join('; ');

  // Reconstruct the public-facing URL from headers set by Nginx.
  // request.url contains the internal localhost URL when behind a reverse proxy,
  // so we use the Host and x-forwarded-proto headers instead.
  const host  = request.headers.get('host') ?? 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') ?? 'http';
  const loginUrl = `${proto}://${host}/admin/login`;

  // Redirect to login so the user can authenticate normally
  return NextResponse.redirect(loginUrl, {
    status: 302,
    headers: { 'Set-Cookie': cookieHeader },
  });
}
