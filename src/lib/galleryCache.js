import fs from 'fs';
import path from 'path';
import { GALLERY_DIR, GALLERY_ALT_FILE } from '@/lib/paths';

const CACHE_TTL = 30_000; // 30 seconds
let _cache = null;
let _cacheTime = 0;

export function invalidateGalleryCache() {
  _cache = null;
}

export function getCachedGalleryItems() {
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache;
  _cache = buildGalleryItems();
  _cacheTime = Date.now();
  return _cache;
}

function buildGalleryItems() {
  let files;
  try {
    files = fs.readdirSync(GALLERY_DIR);
  } catch {
    return [];
  }

  const imageFiles = files.filter(name =>
    /\.(jpe?g|png|webp|gif|mp4|mov|webm)$/i.test(name) &&
    !name.endsWith('.thumb.webp')
  );

  let disabled = new Set();
  try {
    disabled = new Set(JSON.parse(fs.readFileSync(path.join(GALLERY_DIR, '_disabled.json'), 'utf8')));
  } catch { /* no disabled file — all visible */ }

  let altMap = {};
  try { altMap = JSON.parse(fs.readFileSync(GALLERY_ALT_FILE, 'utf8')); } catch { /* no alt file */ }

  const visible = imageFiles.filter(name => !disabled.has(name));

  let order = [];
  try {
    order = JSON.parse(fs.readFileSync(path.join(GALLERY_DIR, '_order.json'), 'utf8'));
  } catch { /* no order file — fall back to alphabetical */ }

  let sorted;
  if (order.length > 0) {
    const orderSet = new Set(order);
    const ordered = order.filter(name => visible.includes(name));
    const remaining = visible.filter(name => !orderSet.has(name)).sort();
    sorted = [...ordered, ...remaining];
  } else {
    sorted = [...visible].sort();
  }

  return sorted.map(name => toItem(name, altMap));
}

function toItem(name, altMap) {
  const isVideo = /\.(mp4|mov|webm)$/i.test(name);
  const base = path.parse(name).name;
  const mtime = Math.floor(fs.statSync(path.join(GALLERY_DIR, name)).mtimeMs / 1000);
  const thumbPath = path.join(GALLERY_DIR, `${base}.thumb.webp`);
  const thumbMtime = fs.existsSync(thumbPath)
    ? Math.floor(fs.statSync(thumbPath).mtimeMs / 1000)
    : null;
  const thumbUrl = thumbMtime ? `/api/uploads/${base}.thumb.webp?v=${thumbMtime}` : null;
  return {
    src: `/api/uploads/${base}?v=${mtime}`,
    isVideo,
    poster: isVideo ? thumbUrl : null,
    thumbUrl,
    alt: altMap[name] || '',
  };
}
