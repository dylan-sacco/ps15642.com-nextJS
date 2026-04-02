// Node.js runtime only — do NOT import in middleware or client components.

import fs from 'fs';
import path from 'path';
import { GALLERY_DIR, BLOGS_DIR } from '@/lib/paths';

export { GALLERY_DIR, BLOGS_DIR };

export function getBackupBaseDir() {
  return process.env.ADMIN_BACKUP_DIR || path.join(process.cwd(), 'data', 'backups');
}

export function getSizeLimitBytes() {
  const mb = parseInt(process.env.ADMIN_BACKUP_SIZE_LIMIT_MB || '500', 10);
  return isNaN(mb) || mb <= 0 ? 500 * 1024 * 1024 : mb * 1024 * 1024;
}

// Recursively sum the size of all files under dirPath.
export function getDirSize(dirPath) {
  try {
    let total = 0;
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      const full = path.join(dirPath, entry.name);
      if (entry.isDirectory()) total += getDirSize(full);
      else total += fs.statSync(full).size;
    }
    return total;
  } catch {
    return 0;
  }
}

// Total size of all backup sets combined.
export function getTotalBackupsSize() {
  return getDirSize(getBackupBaseDir());
}

// Returns a sorted (newest-first) array of backup metadata objects.
export function listBackups() {
  const base = getBackupBaseDir();
  try {
    fs.mkdirSync(base, { recursive: true });
    return fs.readdirSync(base, { withFileTypes: true })
      .filter(e => e.isDirectory() && /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(e.name))
      .map(e => {
        const name = e.name;
        const backupPath = path.join(base, name);
        let meta = {};
        try { meta = JSON.parse(fs.readFileSync(path.join(backupPath, 'meta.json'), 'utf8')); } catch {}
        const gallerySize = getDirSize(path.join(backupPath, 'gallery'));
        // Support both new ('blog') and old ('articles') backup subfolder names
        const blogSize = getDirSize(path.join(backupPath, 'blog')) || getDirSize(path.join(backupPath, 'articles'));
        return {
          name,
          created:  meta.created || name,
          label:    meta.label   || '',
          gallerySize,
          blogSize,
          totalSize: gallerySize + blogSize,
        };
      })
      .sort((a, b) => b.name.localeCompare(a.name));
  } catch {
    return [];
  }
}

// Recursively copy a directory tree from src to dest.
export function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src,  entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

// Validate that a backup name is safe (no path traversal).
export function isSafeName(name) {
  return /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(name);
}
