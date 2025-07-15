import Gallery from '@/components/Gallery';
import fs from 'fs';
import path from 'path';


export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="p-4">
      <Gallery images={images}  />
    </div>
  );
}

async function getGalleryImages() {
  const galleryDir = path.join(process.cwd(), 'public/gallery');
  const files = fs.readdirSync(galleryDir);

  return files
    .filter(name => /\.(jpe?g|png|webp|gif)$/i.test(name))
    .map(name => `/gallery/${name}`);
}
