import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireApiPermission } from '@/lib/adminAuth';

const WHITELIST_FILE = path.join(process.cwd(), 'data', 'ip-whitelist.json');

function readWhitelist() {
  try {
    return JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeWhitelist(list) {
  fs.mkdirSync(path.dirname(WHITELIST_FILE), { recursive: true });
  fs.writeFileSync(WHITELIST_FILE, JSON.stringify(list, null, 2), 'utf8');
}

function isValidIPv4(ip) {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return false;
  return ip.split('.').every(n => Number(n) >= 0 && Number(n) <= 255);
}

// Accepts: plain IPv4, plain IPv6, or IPv4 CIDR (e.g. 203.0.113.0/24, 0.0.0.0/0)
function isValidEntry(ip) {
  if (!ip.includes('/')) {
    // Plain IPv4
    if (isValidIPv4(ip)) return true;
    // Plain IPv6 (basic check)
    if (/^[0-9a-fA-F:]+$/.test(ip) && ip.includes(':')) return true;
    return false;
  }
  // CIDR notation (IPv4 only)
  const [network, bitsStr] = ip.split('/');
  const bits = parseInt(bitsStr, 10);
  return isValidIPv4(network) && !isNaN(bits) && bits >= 0 && bits <= 32;
}

export async function GET() {
  const { error } = await requireApiPermission('whitelist.view');
  if (error) return error;

  const list = readWhitelist();
  const now = Date.now();
  return NextResponse.json(
    list.map(entry => ({ ...entry, expired: new Date(entry.expiresAt).getTime() < now }))
  );
}

export async function POST(request) {
  const { error } = await requireApiPermission('whitelist.manage');
  if (error) return error;

  let ip, label, durationHours;
  try {
    ({ ip, label, durationHours } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!ip || !isValidEntry(ip)) {
    return NextResponse.json(
      { error: 'Invalid IP address or CIDR range (e.g. 203.0.113.0/24)' },
      { status: 400 }
    );
  }

  if (!durationHours || isNaN(durationHours) || durationHours <= 0) {
    return NextResponse.json({ error: 'durationHours must be a positive number' }, { status: 400 });
  }

  const list     = readWhitelist();
  const filtered = list.filter(e => e.ip !== ip);

  const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
  filtered.push({ ip, label: label?.trim() || '', expiresAt });
  writeWhitelist(filtered);

  return NextResponse.json({ ok: true, ip, expiresAt });
}

export async function DELETE(request) {
  const { error } = await requireApiPermission('whitelist.manage');
  if (error) return error;

  let ip;
  try {
    ({ ip } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!ip) {
    return NextResponse.json({ error: 'IP required' }, { status: 400 });
  }

  const list    = readWhitelist();
  const updated = list.filter(e => e.ip !== ip);
  writeWhitelist(updated);
  return NextResponse.json({ ok: true });
}
