import fs from 'fs';
import { BANNERS_FILE, BANNER_SETTINGS_FILE } from './paths.js';

function read() {
  try { return JSON.parse(fs.readFileSync(BANNERS_FILE, 'utf8')); } catch { return []; }
}

function write(banners) {
  fs.writeFileSync(BANNERS_FILE, JSON.stringify(banners, null, 2), 'utf8');
}

export function getBanners() { return read(); }

export function getActiveBanners() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayMMDD = `${mm}-${dd}`;

  return read().filter(b => {
    if (!b.active) return false;

    if (b.recurring) {
      // startDate / endDate stored as "MM-DD"
      const start = b.startDate || null;
      const end   = b.endDate   || null;
      if (!start && !end) return true;
      if (!start) return todayMMDD <= end;
      if (!end)   return todayMMDD >= start;
      // Handle year-wrapping ranges (e.g. Dec 20 – Jan 10)
      if (start <= end) return todayMMDD >= start && todayMMDD <= end;
      return todayMMDD >= start || todayMMDD <= end;
    }

    if (b.startDate && new Date(b.startDate) > now) return false;
    if (b.endDate   && new Date(b.endDate)   < now) return false;
    return true;
  });
}

export function addBanner(data) {
  const banners = read();
  const entry = {
    id: String(Date.now()),
    type: data.type ?? 'announcement',
    permanent: false,
    dismissible: data.dismissible ?? true,
    content: data.content ?? '',
    bgColor: data.bgColor ?? '#16a34a',
    textColor: data.textColor ?? '#ffffff',
    pages: data.pages ?? ['*'],
    priority: data.priority ?? 1,
    active: data.active ?? true,
    startDate: data.startDate ?? null,
    endDate: data.endDate ?? null,
    link: data.link ?? null,
    linkText: data.linkText ?? null,
    sticky: data.sticky ?? false,
    screenTime: data.screenTime ?? null,
    recurring: data.recurring ?? false,
  };
  banners.unshift(entry);
  write(banners);
  return entry;
}

export function updateBanner(id, data) {
  const banners = read();
  const idx = banners.findIndex(b => b.id === id);
  if (idx === -1) return false;
  // Never overwrite permanent flag
  banners[idx] = { ...banners[idx], ...data, id, permanent: banners[idx].permanent };
  write(banners);
  return true;
}

export function getBannerSettings() {
  try { return JSON.parse(fs.readFileSync(BANNER_SETTINGS_FILE, 'utf8')); }
  catch { return { scrollBanner: false, scrollAnimation: true, scrollSpeed: 80, scrollInterval: 5, scrollBannerSticky: false }; }
}

export function updateBannerSettings(data) {
  const current = getBannerSettings();
  const next = { ...current, ...data };
  fs.writeFileSync(BANNER_SETTINGS_FILE, JSON.stringify(next, null, 2), 'utf8');
  return next;
}

export function deleteBanner(id) {
  const banners = read();
  const target = banners.find(b => b.id === id);
  if (!target) return { ok: false, reason: 'not_found' };
  if (target.permanent) return { ok: false, reason: 'permanent' };
  write(banners.filter(b => b.id !== id));
  return { ok: true };
}
