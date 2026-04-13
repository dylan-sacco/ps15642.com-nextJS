import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import MarkdownPreview from '@/components/admin/MarkdownPreview';
import { PAGES_DIR } from '@/lib/paths';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const filePath = path.join(PAGES_DIR, `${slug}.md`);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(raw);
    const title = data.metaTitle || `${data.heroTitle} | P&S Contracting and Landscape`;
    const description = data.metaDescription || '';
    const image = data.heroImage
      ? `https://ps15642.com${data.heroImage}`
      : 'https://ps15642.com/hs1.webp';
    const canonical = data.ogUrl || `https://ps15642.com/${slug}`;

    return {
      title,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        url: canonical,
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

export default async function ServicePage({ params }) {
  const { slug } = await params;

  // Only serve slugs that have a corresponding content/pages/*.md file
  const filePath = path.join(PAGES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  const title = data.metaTitle || `${data.heroTitle} | P&S Contracting and Landscape`;
  const description = data.metaDescription || '';
  const canonical = data.ogUrl || `https://ps15642.com/${slug}`;

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.heroTitle || slug,
    description,
    provider: {
      '@id': 'https://ps15642.com/#business',
      name: 'P&S Contracting and Landscape',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Westmoreland County, Pennsylvania',
    },
    url: canonical,
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <PageHeader title={data.heroTitle || slug} imgUrl={data.heroImage || '/hs1.webp'} />

      <div className="max-w-3xl mx-auto px-6 py-12">
        <MarkdownPreview body={content} />
      </div>
    </div>
  );
}
