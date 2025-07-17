import Gallery from '@/components/Gallery';
import H1Drop from '@/components/H1Drop';
import ParallaxCard from '@/components/ParallaxCard';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: "Gallery | P&S Contracting and Landscape",
  description:
    "View completed landscaping, hardscaping, and property maintenance projects by P&S Contracting and Landscape in Westmoreland County.",
  openGraph: {
    title: "Gallery | P&S Contracting and Landscape",
    description:
      "Take a look at our finished projects showcasing quality work and craftsmanship.",
    url: "https://ps15642.com/gallery",
    siteName: "P&S Contracting and Landscape",
    images: [
      {
        url: "https://ps15642.com/hs1.webp",
        width: 1800,
        height: 800,
        alt: "Gallery - P&S Contracting and Landscape",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};


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
