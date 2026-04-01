import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from 'sharp';
import { GALLERY_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

async function generateVideoThumbnail(videoPath, thumbPath) {
  const tmpPng = path.join(GALLERY_DIR, `_thumb_tmp_${Date.now()}.png`);
  try {
    const result = spawnSync('ffmpeg', [
      '-y', '-i', videoPath,
      '-vframes', '1',
      tmpPng,
    ], { timeout: 30_000 });

    if (result.status !== 0) return false;

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

export async function POST() {
  const { error } = await requireApiPermission('gallery.edit');
  if (error) return error;

  try {
    const files = fs.readdirSync(GALLERY_DIR);
    const videos = files.filter(name =>
      /\.(mp4|mov|webm)$/i.test(name) && !name.endsWith('.thumb.webp')
    );

    let generated = 0;
    let skipped = 0;

    for (const name of videos) {
      const base = path.parse(name).name;
      const thumbPath = path.join(GALLERY_DIR, `${base}.thumb.webp`);

      if (fs.existsSync(thumbPath)) {
        skipped++;
        continue;
      }

      const ok = await generateVideoThumbnail(path.join(GALLERY_DIR, name), thumbPath);
      if (ok) generated++;
    }

    return NextResponse.json({ generated, skipped });
  } catch (err) {
    console.error('Generate thumbnails error:', err);
    return NextResponse.json({ error: 'Failed to generate thumbnails' }, { status: 500 });
  }
}
