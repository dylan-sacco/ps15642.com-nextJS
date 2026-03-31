import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const WHITELIST_FILE = path.join(process.cwd(), 'data', 'ip-whitelist.json');

// Convert a dotted-decimal IPv4 string to an unsigned 32-bit integer.
function ipv4ToInt(ip) {
  // Strip IPv6-mapped prefix if present for CIDR math
  const addr = ip.startsWith('::ffff:') ? ip.slice(7) : ip;
  const parts = addr.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

// Returns true if requestIp matches the whitelist entry's ip field.
// Supports plain IPv4, plain IPv6 (exact), and CIDR notation.
// 0.0.0.0/0 or ::/0 matches every address of their respective types (or all if bits=0).
function ipMatchesEntry(requestIp, entryIp) {
  // Normalize requestIp for exact match comparison
  const normalizedRequestIp = requestIp.startsWith('::ffff:') ? requestIp.slice(7) : requestIp;

  if (!entryIp.includes('/')) {
    // Exact match (IPv4 or IPv6)
    return normalizedRequestIp === entryIp;
  }

  // CIDR match
  const [network, bitsStr] = entryIp.split('/');
  const bits = parseInt(bitsStr, 10);
  
  // Allow up to 128 bits for IPv6 CIDR (though math below is IPv4 only)
  if (isNaN(bits) || bits < 0 || bits > 128) return false;
  
  // A 0-bit mask allows everything (0.0.0.0/0 or ::/0)
  if (bits === 0) return true;

  // IPv4 CIDR math
  const reqInt = ipv4ToInt(normalizedRequestIp);
  const netInt = ipv4ToInt(network);
  if (reqInt === null || netInt === null) return false;

  // If we have a valid netInt but it's an IPv4 CIDR, bits should be <= 32
  if (bits > 32) return false;

  const mask = (~0 << (32 - bits)) >>> 0;
  return (reqInt & mask) === (netInt & mask);
}

export async function GET(request) {
  // Validate internal secret to prevent direct external calls
  const secret = process.env.INTERNAL_SECRET;
  if (!secret) {
    return NextResponse.json({ allowed: false }, { status: 500 });
  }

  const provided = request.headers.get('x-internal-secret');
  if (!provided) {
    return NextResponse.json({ allowed: false }, { status: 401 });
  }

  // Timing-safe comparison
  let valid = false;
  try {
    valid = crypto.timingSafeEqual(
      Buffer.from(provided),
      Buffer.from(secret)
    );
  } catch {
    // Buffers differed in length — invalid
  }

  if (!valid) {
    return NextResponse.json({ allowed: false }, { status: 401 });
  }

  const ip = new URL(request.url).searchParams.get('ip');
  if (!ip) {
    return NextResponse.json({ allowed: false });
  }

  let list = [];
  try {
    list = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8'));
  } catch {
    return NextResponse.json({ allowed: false });
  }

  const now = Date.now();
  const allowed = list.some(
    entry =>
      new Date(entry.expiresAt).getTime() > now &&
      ipMatchesEntry(ip, entry.ip)
  );

  return NextResponse.json({ allowed });
}
