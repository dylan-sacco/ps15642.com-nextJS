import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

export function writeUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------
// Password hashing (pbkdf2 — no external deps)
// ---------------------------------------------------------------------------

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const attempt = crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha256').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(attempt, 'hex'));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Stateless auth token  (base64url payload + "." + base64url HMAC-SHA256 sig)
// No external deps — verified in Edge runtime via Web Crypto (see middleware).
// ---------------------------------------------------------------------------

const TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function signToken(username, role, secret) {
  const payload = Buffer.from(JSON.stringify({
    username,
    role,
    exp: Date.now() + TOKEN_EXPIRY_MS,
  })).toString('base64url');

  const sig = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');

  return `${payload}.${sig}`;
}

// ---------------------------------------------------------------------------
// Cookie helper — returns a Set-Cookie header value string
// ---------------------------------------------------------------------------

export function makeAuthCookieHeader(token) {
  const maxAge = Math.floor(TOKEN_EXPIRY_MS / 1000);
  return [
    `admin_auth=${token}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
  ].join('; ');
}

export function clearAuthCookieHeader() {
  return 'admin_auth=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict';
}
