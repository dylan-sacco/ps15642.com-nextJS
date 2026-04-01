import { NextResponse } from 'next/server';

function isLocalIP(ip) {
  if (!ip) return false;

  // IPv6 loopback
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return true;

  // Strip IPv6-mapped IPv4 prefix
  const addr = ip.startsWith('::ffff:') ? ip.slice(7) : ip;

  // IPv4 loopback
  if (addr === '127.0.0.1') return true;

  const parts = addr.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;

  const [a, b] = parts;

  // 10.0.0.0/8
  if (a === 10) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;

  return false;
}

async function verifyAuthToken(token) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;

  try {
    // Verify HMAC-SHA256 signature using Web Crypto (Edge-compatible)
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = Uint8Array.from(
      atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );
    const dataBytes = new TextEncoder().encode(payloadB64);

    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
    if (!valid) return false;

    // Check expiry
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

// Verifies the admin_bypass cookie (set by /api/admin/auth/bypass).
// Format: "<exp_ms>:<base64url-hmac-sha256>"
async function verifyBypassCookie(cookie) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !cookie) return false;

  const colonIdx = cookie.lastIndexOf(':');
  if (colonIdx === -1) return false;

  const expStr = cookie.slice(0, colonIdx);
  const sigB64  = cookie.slice(colonIdx + 1);
  const exp     = parseInt(expStr, 10);

  if (isNaN(exp) || exp < Date.now()) return false;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes  = Uint8Array.from(
      atob(sigB64.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );
    const dataBytes = new TextEncoder().encode(`bypass:${expStr}`);
    return await crypto.subtle.verify('HMAC', key, sigBytes, dataBytes);
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  if (
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api/admin')
  ) {
    return NextResponse.next();
  }

  // --- Step 1: IP check ---

  // The bypass endpoint must be reachable from any IP so it can set the bypass cookie.
  // It validates its own secret token internally — it's safe to skip IP check here.
  const isBypassEndpoint = pathname === '/api/admin/auth/bypass';

  // ADMIN_DISABLE_IP_CHECK=true completely removes the IP gate (use in dev or emergencies).
  const ipCheckDisabled = process.env.ADMIN_DISABLE_IP_CHECK === 'true';

  if (!isBypassEndpoint && !ipCheckDisabled) {
    // Prefer x-real-ip (set by Nginx), fall back to x-forwarded-for first entry, then request.ip
    const realIP    = request.headers.get('x-real-ip');
    const forwarded = request.headers.get('x-forwarded-for');
    const ip =
      realIP ||
      (forwarded ? forwarded.split(',')[0].trim() : null) ||
      request.ip ||
      '';

    if (!isLocalIP(ip)) {
      // Check bypass cookie first — grants access to holders of the bypass token
      // regardless of IP (useful for cellular / dynamic IPs).
      const bypassCookie = request.cookies.get('admin_bypass')?.value;
      const hasBypass    = bypassCookie ? await verifyBypassCookie(bypassCookie) : false;

      if (!hasBypass) {
        // Not local, no bypass cookie — check the IP whitelist
        const internalSecret = process.env.INTERNAL_SECRET;
        if (!internalSecret) {
          return new NextResponse(
            '403 Forbidden — Admin access is restricted to local network only.',
            { status: 403, headers: { 'Content-Type': 'text/plain' } }
          );
        }

        try {
          const port = process.env.PORT || 3000;
          const checkUrl = new URL(`http://localhost:${port}/api/internal/whitelist-check`);
          checkUrl.searchParams.set('ip', ip);
          const res = await fetch(checkUrl.toString(), {
            headers: { 'x-internal-secret': internalSecret },
          });
          const { allowed } = await res.json();
          if (!allowed) {
            return new NextResponse(
              '403 Forbidden — Admin access is restricted to local network only.',
              { status: 403, headers: { 'Content-Type': 'text/plain' } }
            );
          }
        } catch {
          return new NextResponse(
            '403 Forbidden — Could not verify access.',
            { status: 403, headers: { 'Content-Type': 'text/plain' } }
          );
        }
      }
    }
  }

  // --- Step 2: Auth cookie check ---
  // Login page and auth API routes are exempt — they're how you obtain the cookie
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/api/admin/auth/')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_auth')?.value;
  const authenticated = await verifyAuthToken(token);

  if (!authenticated) {
    const loginUrl = new URL('/admin/login', request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
