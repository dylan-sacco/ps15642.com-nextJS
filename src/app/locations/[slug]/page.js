import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import MarkdownPreview from '@/components/admin/MarkdownPreview';
import { LOCATIONS_DIR } from '@/lib/paths';

export async function generateStaticParams() {
  try {
    return fs.readdirSync(LOCATIONS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(f => ({ slug: f.replace(/\.md$/, '') }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const filePath = path.join(LOCATIONS_DIR, `${slug}.md`);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(raw);
    const title = data.metaTitle || `${data.heroTitle} | P&S Contracting and Landscape`;
    const description = data.metaDescription || '';
    const image = data.heroImage
      ? `https://ps15642.com${data.heroImage}`
      : 'https://ps15642.com/hs1.webp';

    return {
      title,
      description,
      alternates: {
        canonical: `https://ps15642.com/locations/${slug}`,
      },
      openGraph: {
        title,
        description,
        url: `https://ps15642.com/locations/${slug}`,
        siteName: 'P&S Contracting and Landscape',
        images: [{ url: image, width: 1800, height: 800, alt: title }],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {};
  }
}

export default async function LocationPage({ params }) {
  const { slug } = await params;
  const filePath = path.join(LOCATIONS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  const locationName = data.locationName || data.heroTitle || slug;
  const serviceAreaSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    provider: {
      '@id': 'https://ps15642.com/#business',
      name: 'P&S Contracting and Landscape',
    },
    name: `Landscaping and Contracting Services in ${locationName}`,
    description: data.metaDescription || `Professional landscaping, hardscaping, and contracting services in ${locationName} by P&S Contracting and Landscape.`,
    areaServed: {
      '@type': 'City',
      name: locationName,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: 'Westmoreland County, Pennsylvania',
      },
    },
    url: `https://ps15642.com/locations/${slug}`,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceAreaSchema) }}
      />
      <PageHeader title={data.heroTitle || slug} imgUrl={data.heroImage || '/hs1.webp'} />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <MarkdownPreview body={content} />
      </div>
    </div>
  );
}
