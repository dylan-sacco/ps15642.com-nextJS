import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireApiPermission } from '@/lib/adminAuth';
import { getBackupBaseDir, isSafeName, copyDir, GALLERY_DIR, ARTICLES_DIR } from '@/lib/backup';

// POST /api/admin/backup/[name]/restore
// Body: { target: 'gallery' | 'articles' }
export async function POST(request, { params }) {
  const { error } = await requireApiPermission('backup.manage');
  if (error) return error;

  const { name } = await params;

  if (!isSafeName(name)) {
    return NextResponse.json({ error: 'Invalid backup name' }, { status: 400 });
  }

  const { target } = await request.json().catch(() => ({}));

  if (target !== 'gallery' && target !== 'articles') {
    return NextResponse.json({ error: 'target must be "gallery" or "articles"' }, { status: 400 });
  }

  const backupPath = path.join(getBackupBaseDir(), name);
  if (!fs.existsSync(backupPath)) {
    return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
  }

  const srcDir  = path.join(backupPath, target);
  const destDir = target === 'gallery' ? GALLERY_DIR : ARTICLES_DIR;

  if (!fs.existsSync(srcDir)) {
    return NextResponse.json({ error: `Backup contains no ${target} data` }, { status: 404 });
  }

  try {
    // Clear destination, then copy from backup
    fs.rmSync(destDir, { recursive: true, force: true });
    copyDir(srcDir, destDir);
    return NextResponse.json({ success: true, target });
  } catch (err) {
    console.error('Restore error:', err);
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }
}
