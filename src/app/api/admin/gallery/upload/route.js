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

// Returns the set of basenames already in use by gallery files (any extension).
// Excludes .thumb.webp sidecars and internal _ files.
function getUsedBasenames() {
  try {
    return new Set(
      fs.readdirSync(GALLERY_DIR)
        .filter(f => /\.(jpe?g|png|webp|gif|mp4|mov|webm)$/i.test(f) && !f.endsWith('.thumb.webp'))
        .map(f => path.parse(f).name.toLowerCase())
    );
  } catch {
    return new Set();
  }
}

// If `desiredFilename`'s basename is already taken (any extension), appends a
// short random suffix until a free name is found.
function resolveUniqueName(desiredFilename) {
  const used = getUsedBasenames();
  const ext = path.extname(desiredFilename);
  const base = path.parse(desiredFilename).name;
  if (!used.has(base.toLowerCase())) return desiredFilename;
  let candidate;
  do {
    const suffix = Math.random().toString(36).slice(2, 7); // 5-char random a-z0-9
    candidate = `${base}-${suffix}${ext}`;
  } while (used.has(path.parse(candidate).name.toLowerCase()));
  return candidate;
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

function convertVideoToMp4(inputPath, outputPath) {
  const result = spawnSync('ffmpeg', [
    '-y',
    '-i', inputPath,
    '-c:v', 'libx264',
    '-crf', '23',
    '-preset', 'fast',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart', // moov atom at front — required for streaming
    outputPath,
  ], { timeout: 5 * 60 * 1000 }); // 5 min timeout

  return result.status === 0;
}

async function generateVideoThumbnail(videoPath, thumbPath) {
  const tmpPng = path.join(GALLERY_DIR, `_thumb_tmp_${Date.now()}.png`);
  try {
    // Extract first frame as PNG
    const result = spawnSync('ffmpeg', [
      '-y', '-i', videoPath,
      '-vframes', '1',
      tmpPng,
    ], { timeout: 30_000 });

    if (result.status !== 0) return;

    // Resize and convert to WebP with sharp
    await sharp(tmpPng)
      .resize(800, null, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(thumbPath);
  } catch {
    // ffmpeg unavailable or frame extraction failed — skip thumbnail silently
  } finally {
    try { fs.unlinkSync(tmpPng); } catch { /* ignore */ }
  }
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
        if (convertToWebp && ext !== 'mp4') {
          // Convert video to MP4 (H.264/AAC) via ffmpeg
          finalName = resolveUniqueName(sanitizeFilename(baseName + '.mp4'));
          const destPath = path.join(GALLERY_DIR, finalName);
          const tmpInput = path.join(GALLERY_DIR, `_tmp_${Date.now()}_input.${ext}`);

          fs.writeFileSync(tmpInput, buffer);
          const ok = convertVideoToMp4(tmpInput, destPath);
          fs.unlinkSync(tmpInput);

          if (!ok) {
            // ffmpeg not available or failed — save original format
            finalName = resolveUniqueName(sanitizeFilename(file.name));
            fs.writeFileSync(path.join(GALLERY_DIR, finalName), buffer);
          }
        } else {
          finalName = resolveUniqueName(sanitizeFilename(file.name));
          fs.writeFileSync(path.join(GALLERY_DIR, finalName), buffer);
        }
      } else {
        // Image
        let finalBuffer;
        if (convertToWebp && ext !== 'webp') {
          finalName = resolveUniqueName(sanitizeFilename(baseName + '.webp'));
          finalBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
        } else {
          finalName = resolveUniqueName(sanitizeFilename(file.name));
          finalBuffer = buffer;
        }
        fs.writeFileSync(path.join(GALLERY_DIR, finalName), finalBuffer);
      }

      // Generate thumbnail sidecar
      const base = path.parse(finalName).name;
      const thumbPath = path.join(GALLERY_DIR, `${base}.thumb.webp`);
      if (isVideo) {
        await generateVideoThumbnail(path.join(GALLERY_DIR, finalName), thumbPath);
      } else {
        try {
          await sharp(path.join(GALLERY_DIR, finalName))
            .resize(600, 600, { fit: 'cover', withoutEnlargement: true })
            .webp({ quality: 75 })
            .toFile(thumbPath);
        } catch { /* non-fatal — full image will be used as fallback */ }
      }

      uploaded.push(finalName);
    }

    // Prepend to order so new photos appear at the top
    const order = readOrder();
    const existing = new Set(order);
    const newEntries = uploaded.filter(name => !existing.has(name));
    writeOrder([...newEntries, ...order]);

    const thumbUrls = {};
    for (const name of uploaded) {
      const base = path.parse(name).name;
      const thumbFile = `${base}.thumb.webp`;
      if (fs.existsSync(path.join(GALLERY_DIR, thumbFile))) {
        thumbUrls[name] = `/api/uploads/${thumbFile}`;
      }
    }

    return NextResponse.json({ uploaded, thumbUrls }, { status: 201 });
  } catch (err) {
    console.error('Gallery upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
