import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { spawnFfmpeg } from '@/lib/ffmpeg';
import { GALLERY_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

async function generateVideoThumbnail(videoPath, thumbPath) {
  const tmpPng = path.join(GALLERY_DIR, `_thumb_tmp_${Date.now()}.png`);
  try {
    const ok = await spawnFfmpeg(['-y', '-i', videoPath, '-vframes', '1', tmpPng], 30_000);
    if (!ok) return false;

    await sharp(tmpPng)
      .resize(800, null, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbPath);
    return true;
  } catch {
    return false;
  } finally {
    try { fs.unlinkSync(tmpPng); } catch { /* ignore */ }
  }
}

async function generateImageThumbnail(srcPath, thumbPath) {
  try {
    await sharp(srcPath)
      .resize(600, 600, { fit: 'cover', withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbPath);
    return true;
  } catch {
    return false;
  }
}

async function processOne(name) {
  if (name.includes('..') || name.includes('/') || name.includes('\\')) return false;
  const srcPath = path.join(GALLERY_DIR, name);
  if (!fs.existsSync(srcPath)) return false;
  const base = path.parse(name).name;
  const thumbPath = path.join(GALLERY_DIR, `${base}.thumb.webp`);
  if (/\.(mp4|mov|webm)$/i.test(name)) return generateVideoThumbnail(srcPath, thumbPath);
  if (/\.(jpe?g|png|webp|gif)$/i.test(name)) return generateImageThumbnail(srcPath, thumbPath);
  return false;
}

export async function POST(request) {
  const { error } = await requireApiPermission('gallery.edit');
  if (error) return error;

  try {
    const body = await request.json().catch(() => ({}));

    // Single-file mode
    if (body.filename) {
      const ok = await processOne(body.filename);
      if (!ok) return NextResponse.json({ error: 'Failed to generate thumbnail' }, { status: 500 });
      const base = path.parse(body.filename).name;
      const thumbFile = `${base}.thumb.webp`;
      const thumbPath = path.join(GALLERY_DIR, thumbFile);
      const mtime = fs.existsSync(thumbPath) ? Math.floor(fs.statSync(thumbPath).mtimeMs / 1000) : Date.now();
      return NextResponse.json({ generated: 1, skipped: 0, thumbUrl: `/api/uploads/${thumbFile}?v=${mtime}` });
    }

    // Bulk mode
    const files = fs.readdirSync(GALLERY_DIR);
    let generated = 0;
    let skipped = 0;

    const candidates = files.filter(name =>
      /\.(mp4|mov|webm|jpe?g|png|webp|gif)$/i.test(name) && !name.endsWith('.thumb.webp')
    );
    for (const name of candidates) {
      const base = path.parse(name).name;
      const thumbPath = path.join(GALLERY_DIR, `${base}.thumb.webp`);
      if (fs.existsSync(thumbPath)) { skipped++; continue; }
      const ok = await processOne(name);
      if (ok) generated++;
    }

    return NextResponse.json({ generated, skipped });
  } catch (err) {
    console.error('Generate thumbnails error:', err);
    return NextResponse.json({ error: 'Failed to generate thumbnails' }, { status: 500 });
  }
}
