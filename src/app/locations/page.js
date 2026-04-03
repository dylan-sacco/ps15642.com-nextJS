import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { LOCATIONS_DIR } from '@/lib/paths';
import H1Drop from '@/components/H1Drop';
import GreenCard from '@/components/GreenCard';

export const metadata = {
  title: 'Service Areas | P&S Contracting and Landscape',
  description:
    'P&S Contracting and Landscape proudly serves Westmoreland County and surrounding communities in southwestern Pennsylvania. Find your area and see how we can help.',
};

function getLocationPages() {
  try {
    return fs.readdirSync(LOCATIONS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const slug = f.replace(/\.md$/, '');
        const raw = fs.readFileSync(path.join(LOCATIONS_DIR, f), 'utf8');
        const { data } = matter(raw);
        return { slug, heroTitle: data.heroTitle || slug, heroImage: data.heroImage || '/hs1.webp' };
      });
  } catch {
    return [];
  }
}

export default function LocationsPage() {
  const locations = getLocationPages();

  return (
    <div>
      <div className="max-w-4xl mx-auto px-6 py-14 text-center">
        <H1Drop>Our Service Areas</H1Drop>
        <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
          P&amp;S Contracting and Landscape proudly serves communities throughout
          Westmoreland County and southwestern Pennsylvania. From residential
          landscaping and hardscaping to full contracting work, our team brings
          years of experience directly to your neighborhood.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(loc => (
            <Link
              key={loc.slug}
              href={`/locations/${loc.slug}`}
              className="group block rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={loc.heroImage}
                alt={loc.heroTitle}
                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="p-4 bg-white">
                <p className="font-semibold text-gray-800 group-hover:text-lime-700 transition-colors">
                  {loc.heroTitle}
                </p>
                <span className="mt-2 inline-block text-xs font-medium text-lime-700 group-hover:underline">
                  Learn more →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <GreenCard>
        Don&apos;t see your area listed? Give us a call — we serve many communities
        throughout Westmoreland County and are happy to discuss your project.
      </GreenCard>
    </div>
  );
}
