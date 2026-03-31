import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const WHITELIST_FILE = path.join(process.cwd(), 'data', 'ip-whitelist.json');

// Convert a dotted-decimal IPv4 string to an unsigned 32-bit integer.
function ipv4ToInt(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

// Returns true if requestIp matches the whitelist entry's ip field.
// Supports plain IPv4, plain IPv6 (exact), and IPv4 CIDR notation (e.g. 203.0.113.0/24).
// 0.0.0.0/0 matches every IPv4 address.
function ipMatchesEntry(requestIp, entryIp) {
  if (!entryIp.includes('/')) {
    // Exact match (IPv4 or IPv6)
    return requestIp === entryIp;
  }

  // CIDR match — IPv4 only
  const [network, bitsStr] = entryIp.split('/');
  const bits = parseInt(bitsStr, 10);
  if (isNaN(bits) || bits < 0 || bits > 32) return false;
  if (bits === 0) return true; // 0.0.0.0/0 — allow all

  const reqInt = ipv4ToInt(requestIp);
  const netInt = ipv4ToInt(network);
  if (reqInt === null || netInt === null) return false;

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
