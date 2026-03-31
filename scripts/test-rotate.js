#!/usr/bin/env node
/**
 * Rotation diagnostic script — run this directly on the Ubuntu server:
 *
 *   node scripts/test-rotate.js
 *
 * It creates synthetic test images at increasing sizes, runs the same
 * rotation logic used in /api/admin/gallery/rotate, and reports memory
 * usage at each step. This helps identify the size threshold at which
 * the process OOMs.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ─── helpers ────────────────────────────────────────────────────────────────

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function memReport(label) {
  const m = process.memoryUsage();
  const free = os.freemem();
  const total = os.totalmem();
  console.log(
    `  [${label}] rss=${mb(m.rss)}  heap=${mb(m.heapUsed)}/${mb(m.heapTotal)}  ` +
    `external=${mb(m.external)}  free-sys=${mb(free)}/${mb(total)}`
  );
}

// Same rotation logic as the API route
async function rotateFile(filePath) {
  const ext = path.extname(filePath).toLowerCase().slice(1);
  const format = ext === 'jpg' ? 'jpeg' : ext;
  const tmpPath = filePath + '.tmp';

  sharp.cache(false);
  sharp.concurrency(1);

  await sharp(filePath)
    .rotate(90)
    .toFormat(format)
    .toFile(tmpPath);

  fs.renameSync(tmpPath, filePath);
}

// ─── test runner ────────────────────────────────────────────────────────────

async function runTest({ label, widthPx, heightPx, format }) {
  const tmpDir = os.tmpdir();
  const filename = `rotate-test-${widthPx}x${heightPx}.${format}`;
  const filePath = path.join(tmpDir, filename);

  process.stdout.write(`\n── ${label} (${widthPx}×${heightPx} ${format.toUpperCase()}) ──\n`);

  // Create synthetic test image
  process.stdout.write('  Creating test image... ');
  try {
    const creator = sharp({
      create: {
        width: widthPx,
        height: heightPx,
        channels: 3,
        background: { r: 100, g: 149, b: 237 },
      },
    });

    if (format === 'jpeg' || format === 'jpg') {
      await creator.jpeg({ quality: 85 }).toFile(filePath);
    } else if (format === 'webp') {
      await creator.webp({ quality: 85 }).toFile(filePath);
    } else if (format === 'png') {
      await creator.png().toFile(filePath);
    }

    const stat = fs.statSync(filePath);
    console.log(`done (${mb(stat.size)} on disk)`);
  } catch (err) {
    console.log(`FAILED to create: ${err.message}`);
    return;
  }

  memReport('before rotate');

  const start = Date.now();
  try {
    await rotateFile(filePath);
    const elapsed = ((Date.now() - start) / 1000).toFixed(2);
    memReport('after rotate ');
    console.log(`  Rotation OK in ${elapsed}s`);
  } catch (err) {
    console.log(`  ROTATION FAILED: ${err.message}`);
    console.log(`  Stack: ${err.stack}`);
  } finally {
    try { fs.unlinkSync(filePath); } catch { /* ignore */ }
    try { fs.unlinkSync(filePath + '.tmp'); } catch { /* ignore */ }
  }
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('Sharp version:', sharp.versions);
  console.log('Node version: ', process.version);
  console.log('Platform:     ', process.platform, os.arch());
  console.log('Total RAM:    ', mb(os.totalmem()));
  console.log('Free RAM:     ', mb(os.freemem()));
  console.log('CPU cores:    ', os.cpus().length);

  memReport('baseline');

  // Test matrix — escalating sizes to find the failure threshold
  const tests = [
    { label: 'Small JPEG',        widthPx: 800,  heightPx: 600,  format: 'jpeg' },
    { label: 'Medium JPEG',       widthPx: 2000, heightPx: 1500, format: 'jpeg' },
    { label: 'iPhone 12 JPEG',    widthPx: 4032, heightPx: 3024, format: 'jpeg' },
    { label: 'iPhone 14 Pro JPEG',widthPx: 4284, heightPx: 5712, format: 'jpeg' },
    { label: 'Small WebP',        widthPx: 800,  heightPx: 600,  format: 'webp' },
    { label: 'Medium WebP',       widthPx: 2000, heightPx: 1500, format: 'webp' },
    { label: 'iPhone WebP',       widthPx: 4032, heightPx: 3024, format: 'webp' },
  ];

  for (const test of tests) {
    await runTest(test);
    // Give GC a chance between tests
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n── Done ──');
  memReport('final');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
