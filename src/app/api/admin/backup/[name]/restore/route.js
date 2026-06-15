import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireApiPermission } from '@/lib/adminAuth';
import { getBackupBaseDir, isSafeName, copyDir, GALLERY_DIR, BLOGS_DIR } from '@/lib/backup';

// POST /api/admin/backup/[name]/restore
// Body: { target: 'gallery' | 'blog' }
export async function POST(request, { params }) {
  const { error } = await requireApiPermission('backup.manage');
  if (error) return error;

  const { name } = await params;

  if (!isSafeName(name)) {
    return NextResponse.json({ error: 'Invalid backup name' }, { status: 400 });
  }

  const { target } = await request.json().catch(() => ({}));

  if (target !== 'gallery' && target !== 'blog') {
    return NextResponse.json({ error: 'target must be "gallery" or "blog"' }, { status: 400 });
  }

  const backupPath = path.join(getBackupBaseDir(), name);
  if (!fs.existsSync(backupPath)) {
    return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
  }

  // Support both new ('blog') and old ('articles') backup subfolder names
  let srcDir = path.join(backupPath, target);
  if (target === 'blog' && !fs.existsSync(srcDir)) {
    srcDir = path.join(backupPath, 'articles'); // backward compat with older backups
  }
  const destDir = target === 'gallery' ? GALLERY_DIR : BLOGS_DIR;

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
