import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireApiPermission } from '@/lib/adminAuth';
import {
  getBackupBaseDir,
  getSizeLimitBytes,
  getTotalBackupsSize,
  getDirSize,
  listBackups,
  copyDir,
  GALLERY_DIR,
  ARTICLES_DIR,
} from '@/lib/backup';

// GET /api/admin/backup — list backups + storage summary
export async function GET() {
  const { error } = await requireApiPermission('backup.view');
  if (error) return error;

  const backups    = listBackups();
  const usedBytes  = getTotalBackupsSize();
  const limitBytes = getSizeLimitBytes();

  return NextResponse.json({ backups, usedBytes, limitBytes });
}

// POST /api/admin/backup — create a new backup set
export async function POST(request) {
  const { error } = await requireApiPermission('backup.manage');
  if (error) return error;

  const { label = '' } = await request.json().catch(() => ({}));

  // Measure what we're about to copy
  const gallerySize  = getDirSize(GALLERY_DIR);
  const articlesSize = getDirSize(ARTICLES_DIR);
  const newSize      = gallerySize + articlesSize;

  const usedBytes  = getTotalBackupsSize();
  const limitBytes = getSizeLimitBytes();

  if (usedBytes + newSize > limitBytes) {
    return NextResponse.json(
      { error: `Backup would exceed the ${Math.round(limitBytes / 1024 / 1024)} MB storage limit. Delete older backups first.` },
      { status: 507 }
    );
  }

  // Generate timestamp name
  const now  = new Date();
  const pad  = n => String(n).padStart(2, '0');
  const name = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  const dest = path.join(getBackupBaseDir(), name);

  try {
    fs.mkdirSync(dest, { recursive: true });

    // Copy gallery (skip if empty/missing)
    try { copyDir(GALLERY_DIR, path.join(dest, 'gallery')); } catch { fs.mkdirSync(path.join(dest, 'gallery'), { recursive: true }); }
    // Copy articles
    try { copyDir(ARTICLES_DIR, path.join(dest, 'articles')); } catch { fs.mkdirSync(path.join(dest, 'articles'), { recursive: true }); }

    fs.writeFileSync(
      path.join(dest, 'meta.json'),
      JSON.stringify({ created: now.toISOString(), label: label.trim().slice(0, 80) }),
      'utf8'
    );

    return NextResponse.json({ success: true, name });
  } catch (err) {
    console.error('Backup create error:', err);
    // Clean up partial backup on failure
    try { fs.rmSync(dest, { recursive: true, force: true }); } catch {}
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  }
}
