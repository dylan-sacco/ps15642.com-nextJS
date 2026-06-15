import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { spawnFfmpeg } from '@/lib/ffmpeg';
import { GALLERY_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

function readJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

const FORMATS = {
  mp4: {
    ext: '.mp4',
    args: (output) => [
      '-c:v', 'libx264', '-crf', '23', '-preset', 'fast',
      '-c:a', 'aac', '-b:a', '128k',
      '-movflags', '+faststart',
      output,
    ],
  },
  webm: {
    ext: '.webm',
    args: (output) => [
      '-c:v', 'libvpx-vp9', '-cq', '33', '-b:v', '0',
      '-c:a', 'libopus',
      output,
    ],
  },
};

export async function POST(request) {
  const { error } = await requireApiPermission('gallery.edit');
  if (error) return error;

  try {
    const { filename, targetFormat } = await request.json();

    if (!filename) {
      return NextResponse.json({ error: 'filename required' }, { status: 400 });
    }

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    if (!/\.(mp4|mov|webm)$/i.test(filename)) {
      return NextResponse.json({ error: 'Not a video file' }, { status: 400 });
    }

    const format = FORMATS[targetFormat];
    if (!format) {
      return NextResponse.json({ error: `Unsupported target format: ${targetFormat}` }, { status: 400 });
    }

    const currentExt = path.extname(filename).toLowerCase();
    if (currentExt === format.ext) {
      return NextResponse.json({ error: `Already a ${targetFormat.toUpperCase()} file` }, { status: 400 });
    }

    const oldPath = path.join(GALLERY_DIR, filename);
    if (!fs.existsSync(oldPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const basename = path.parse(filename).name;
    const newFilename = basename + format.ext;
    const newPath = path.join(GALLERY_DIR, newFilename);

    if (fs.existsSync(newPath)) {
      return NextResponse.json({ error: `${newFilename} already exists` }, { status: 409 });
    }

    const ok = await spawnFfmpeg(['-y', '-i', oldPath, ...format.args(newPath)]);
    if (!ok) {
      return NextResponse.json(
        { error: 'ffmpeg conversion failed. Is ffmpeg installed on the server?' },
        { status: 500 }
      );
    }

    // Remove old file
    fs.unlinkSync(oldPath);

    // Update _order.json
    const orderPath = path.join(GALLERY_DIR, '_order.json');
    const order = readJson(orderPath);
    if (Array.isArray(order)) {
      const idx = order.indexOf(filename);
      if (idx !== -1) order[idx] = newFilename;
      writeJson(orderPath, order);
    }

    // Update _disabled.json
    const disabledPath = path.join(GALLERY_DIR, '_disabled.json');
    const disabled = readJson(disabledPath);
    if (Array.isArray(disabled)) {
      const idx = disabled.indexOf(filename);
      if (idx !== -1) {
        disabled[idx] = newFilename;
        writeJson(disabledPath, disabled);
      }
    }

    // Thumbnail sidecar basename is unchanged (e.g. video.webm → video.mp4 keeps video.thumb.webp)
    const thumbFile = `${basename}.thumb.webp`;
    const thumbPath = path.join(GALLERY_DIR, thumbFile);
    const mtime = Math.floor(fs.statSync(newPath).mtimeMs / 1000);
    const thumbUrl = fs.existsSync(thumbPath)
      ? `/api/uploads/${thumbFile}?v=${Math.floor(fs.statSync(thumbPath).mtimeMs / 1000)}`
      : null;

    return NextResponse.json({ success: true, newFilename, thumbUrl, mtime });
  } catch (err) {
    console.error('Gallery video convert error:', err);
    return NextResponse.json({ error: 'Conversion failed' }, { status: 500 });
  }
}
