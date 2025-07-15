import Gallery from '@/components/Gallery';
import H1Drop from '@/components/H1Drop';
import ParallaxCard from '@/components/ParallaxCard';
import fs from 'fs';
import path from 'path';


export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="">
      <ParallaxCard>
        <H1Drop color="text-white" size="text-4xl md:text-6xl">
          Our Gallery
        </H1Drop>
      </ParallaxCard>
      <Gallery images={images} />
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
