import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from 'sharp';
import { GALLERY_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'mov', 'webm']);
const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm',
]);
const IMAGE_MAX_SIZE = 20 * 1024 * 1024;  // 20 MB
const VIDEO_MAX_SIZE = 500 * 1024 * 1024; // 500 MB

const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'webm']);

function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^[-.]/, '')
    .toLowerCase();
}

function readOrder() {
  const orderPath = path.join(GALLERY_DIR, '_order.json');
  try {
    return JSON.parse(fs.readFileSync(orderPath, 'utf8'));
  } catch {
    return [];
  }
}

function writeOrder(order) {
  const orderPath = path.join(GALLERY_DIR, '_order.json');
  fs.writeFileSync(orderPath, JSON.stringify(order, null, 2), 'utf8');
}

function convertVideoToWebm(inputPath, outputPath) {
  const result = spawnSync('ffmpeg', [
    '-y',
    '-i', inputPath,
    '-c:v', 'libvpx-vp9',
    '-cq', '33',
    '-b:v', '0',
    '-c:a', 'libopus',
    outputPath,
  ], { timeout: 5 * 60 * 1000 }); // 5 min timeout

  return result.status === 0;
}

export async function POST(request) {
  const { error } = await requireApiPermission('gallery.upload');
  if (error) return error;

  try {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });

    const formData = await request.formData();
    const files = formData.getAll('files');
    const convertToWebp = formData.get('convertToWebp') === '1';

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploaded = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const isVideo = VIDEO_EXTENSIONS.has(ext);

      if (!ALLOWED_EXTENSIONS.has(ext)) {
        return NextResponse.json(
          { error: `File type .${ext} not allowed` },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME.has(file.type)) {
        return NextResponse.json(
          { error: `MIME type ${file.type} not allowed` },
          { status: 400 }
        );
      }

      const maxSize = isVideo ? VIDEO_MAX_SIZE : IMAGE_MAX_SIZE;
      if (file.size > maxSize) {
        const limitMb = maxSize / 1024 / 1024;
        return NextResponse.json(
          { error: `File ${file.name} exceeds ${limitMb} MB limit` },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const baseName = file.name.replace(/\.[^.]+$/, '');
      let finalName;

      if (isVideo) {
        if (convertToWebp && ext !== 'webm') {
          // Convert video to WebM via ffmpeg
          const tmpInput = path.join(GALLERY_DIR, `_tmp_${Date.now()}_input.${ext}`);
          finalName = sanitizeFilename(baseName + '.webm');
          const destPath = path.join(GALLERY_DIR, finalName);

          fs.writeFileSync(tmpInput, buffer);
          const ok = convertVideoToWebm(tmpInput, destPath);
          fs.unlinkSync(tmpInput);

          if (!ok) {
            // ffmpeg not available or failed — save original
            finalName = sanitizeFilename(file.name);
            fs.writeFileSync(path.join(GALLERY_DIR, finalName), buffer);
          }
        } else {
          finalName = sanitizeFilename(file.name);
          fs.writeFileSync(path.join(GALLERY_DIR, finalName), buffer);
        }
      } else {
        // Image
        let finalBuffer;
        if (convertToWebp && ext !== 'webp') {
          finalName = sanitizeFilename(baseName + '.webp');
          finalBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
        } else {
          finalName = sanitizeFilename(file.name);
          finalBuffer = buffer;
        }
        fs.writeFileSync(path.join(GALLERY_DIR, finalName), finalBuffer);
      }

      uploaded.push(finalName);
    }

    // Prepend to order so new photos appear at the top
    const order = readOrder();
    const existing = new Set(order);
    const newEntries = uploaded.filter(name => !existing.has(name));
    writeOrder([...newEntries, ...order]);

    return NextResponse.json({ uploaded }, { status: 201 });
  } catch (err) {
    console.error('Gallery upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
