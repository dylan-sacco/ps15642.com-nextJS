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

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  if (
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api/admin')
  ) {
    return NextResponse.next();
  }

  // Prefer x-real-ip (set by Nginx), fall back to x-forwarded-for first entry, then request.ip
  const realIP = request.headers.get('x-real-ip');
  const forwarded = request.headers.get('x-forwarded-for');
  const ip =
    realIP ||
    (forwarded ? forwarded.split(',')[0].trim() : null) ||
    request.ip ||
    '';

  // if (!isLocalIP(ip)) {
  //   return new NextResponse(
  //     '403 Forbidden — Admin access is restricted to local network only.',
  //     { status: 403, headers: { 'Content-Type': 'text/plain' } }
  //   );
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
