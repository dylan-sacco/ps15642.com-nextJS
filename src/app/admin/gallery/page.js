import fs from 'fs';
import path from 'path';
import { GALLERY_DIR } from '@/lib/paths';
import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import GalleryManager from '@/components/admin/GalleryManager';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Gallery Manager | Admin' };

function getAdminGalleryImages() {
  try {
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
    const files = fs.readdirSync(GALLERY_DIR);
    const imageFiles = files.filter(name =>
      /\.(jpe?g|png|webp|gif|mp4|mov|webm)$/i.test(name) &&
      !name.endsWith('.thumb.webp')
    );

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

    return sorted.map(name => {
      const isVideo = /\.(mp4|mov|webm)$/i.test(name);
      const base = path.parse(name).name;
      const thumbFile = `${base}.thumb.webp`;
      const thumbUrl = isVideo && fs.existsSync(path.join(GALLERY_DIR, thumbFile))
        ? `/api/uploads/${thumbFile}`
        : null;
      return { filename: name, url: `/api/uploads/${base}`, disabled: disabled.has(name), thumbUrl };
    });
  } catch {
    return [];
  }
}

export default async function AdminGalleryPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'gallery.view')) {
    return <PermissionDenied permission="gallery.view" />;
  }

  const images = getAdminGalleryImages();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gallery Manager</h1>
      <GalleryManager initialImages={images} />
    </div>
  );
}
