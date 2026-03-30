import fs from 'fs';
import path from 'path';
import { GALLERY_DIR } from '@/lib/paths';
import GalleryManager from '@/components/admin/GalleryManager';

export const metadata = { title: 'Gallery Manager | Admin' };

function getAdminGalleryImages() {
  try {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
    const files = fs.readdirSync(GALLERY_DIR);
    const imageFiles = files.filter(name => /\.(jpe?g|png|webp|gif)$/i.test(name));

    // Read order
    let order = [];
    try {
      order = JSON.parse(fs.readFileSync(path.join(GALLERY_DIR, '_order.json'), 'utf8'));
    } catch { /* no order */ }

    // Read disabled
    let disabled = new Set();
    try {
      disabled = new Set(JSON.parse(fs.readFileSync(path.join(GALLERY_DIR, '_disabled.json'), 'utf8')));
    } catch { /* no disabled */ }

    // Sort by order
    let sorted;
    if (order.length > 0) {
      const orderSet = new Set(order);
      const ordered = order.filter(name => imageFiles.includes(name));
      const remaining = imageFiles.filter(name => !orderSet.has(name)).sort();
      sorted = [...ordered, ...remaining];
    } else {
      sorted = [...imageFiles].sort();
    }

    return sorted.map(name => ({
      filename: name,
      url: `/gallery/${name}`,
      disabled: disabled.has(name),
    }));
  } catch {
    return [];
  }
}

export default function AdminGalleryPage() {
  const images = getAdminGalleryImages();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gallery Manager</h1>
      <GalleryManager initialImages={images} />
    </div>
  );
}
