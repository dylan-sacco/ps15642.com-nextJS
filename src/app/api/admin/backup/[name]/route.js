import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireApiPermission } from '@/lib/adminAuth';
import { getBackupBaseDir, isSafeName } from '@/lib/backup';

// DELETE /api/admin/backup/[name] — delete a backup set
export async function DELETE(request, { params }) {
  const { error } = await requireApiPermission('backup.manage');
  if (error) return error;

  const { name } = await params;

  if (!isSafeName(name)) {
    return NextResponse.json({ error: 'Invalid backup name' }, { status: 400 });
  }

  const backupPath = path.join(getBackupBaseDir(), name);

  if (!fs.existsSync(backupPath)) {
    return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
  }

  try {
    fs.rmSync(backupPath, { recursive: true, force: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Backup delete error:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
