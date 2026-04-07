import Gallery from '@/components/Gallery';
import H1Drop from '@/components/H1Drop';
import ParallaxCard from '@/components/ParallaxCard';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import Link from 'next/link';
import fs from 'fs';
import { BEFORE_AFTER_FILE } from '@/lib/paths';
import { getCachedGalleryItems } from '@/lib/galleryCache';

export const dynamic = 'force-dynamic';

// Set to true to show alt text as a caption beneath images in the fullscreen preview.
const SHOW_ALT_TEXT = false;

export const metadata = {
  title: "Gallery | P&S Contracting and Landscape",
  description:
    "View completed landscaping, hardscaping, and property maintenance projects by P&S Contracting and Landscape in Westmoreland County.",
  openGraph: {
    title: "Gallery | P&S Contracting and Landscape",
    description:
      "Take a look at our finished projects showcasing quality work and craftsmanship.",
    url: "/gallery",
    siteName: "P&S Contracting and Landscape",
    images: [
      {
        url: "/hs1.webp",
        width: 1800,
        height: 800,
        alt: "Gallery - P&S Contracting and Landscape",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default async function GalleryPage({ searchParams }) {
  const { tab } = await searchParams;
  const activeTab = tab === 'before-after' ? 'before-after' : 'gallery';

  const images = activeTab === 'gallery' ? getCachedGalleryItems() : [];
  const pairs = activeTab === 'before-after' ? getPairs() : [];

  return (
    <div>
      <ParallaxCard>
        <H1Drop color="text-white" size="text-4xl md:text-6xl">
          Our Gallery
        </H1Drop>
      </ParallaxCard>

      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pt-3">
          <Link
            href="/gallery"
            className={`px-5 py-2.5 text-sm font-medium rounded-t border-b-2 transition-colors ${
              activeTab === 'gallery'
                ? 'border-lime-600 text-lime-700 bg-lime-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gallery
          </Link>
          <Link
            href="/gallery?tab=before-after"
            className={`px-5 py-2.5 text-sm font-medium rounded-t border-b-2 transition-colors ${
              activeTab === 'before-after'
                ? 'border-lime-600 text-lime-700 bg-lime-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Before &amp; After
          </Link>
        </div>
      </div>

      {activeTab === 'gallery' && (
        <Gallery images={images} showAltText={SHOW_ALT_TEXT} pageSize={24} />
      )}

      {activeTab === 'before-after' && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          {pairs.length === 0 ? (
            <p className="text-center text-gray-400 py-20">No before/after pairs yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pairs.map(p => (
                <BeforeAfterSlider
                  key={p.id}
                  beforeSrc={p.beforeImage}
                  afterSrc={p.afterImage}
                  title={p.title}
                  description={p.description}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getPairs() {
  try { return JSON.parse(fs.readFileSync(BEFORE_AFTER_FILE, 'utf8')); } catch { return []; }
}
