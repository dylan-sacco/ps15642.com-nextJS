import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PROJECTS_DIR } from '@/lib/paths';
import MarkdownPreview from '@/components/admin/MarkdownPreview';
import Gallery from '@/components/Gallery';

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(t => String(t).trim()).filter(Boolean);
  return String(raw).split(',').map(t => t.trim()).filter(Boolean);
}

function parseGallery(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(item => item && typeof item.filename === 'string')
    .map(item => ({ filename: item.filename, enabled: item.enabled !== false }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(raw);
    if (!data.published) return {};
    const rawImage = data.image
      ? (data.image.startsWith('http') || data.image.startsWith('/') ? data.image : `/${data.image}`)
      : null;
    const ogImage = rawImage || '/hs1.webp';
    return {
      title: `${data.title} | P&S Contracting and Landscape`,
      description: data.excerpt || '',
      openGraph: {
        title: data.title,
        description: data.excerpt || '',
        url: `/projects/${slug}`,
        siteName: 'P&S Contracting and Landscape',
        images: [{ url: ogImage, width: 1200, height: 630 }],
        locale: 'en_US',
        type: 'article',
        publishedTime: data.date || undefined,
        tags: parseTags(data.tags),
      },
    };
  } catch {
    return {};
  }
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();

  const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  if (!data.published) notFound();

  const tags = parseTags(data.tags);
  const gallery = parseGallery(data.gallery);

  // Ensure relative paths have a leading slash (guards against malformed stored values)
  const rawImage = data.image
    ? (data.image.startsWith('http') || data.image.startsWith('/') ? data.image : `/${data.image}`)
    : null;
  const ogImage = rawImage || '/hs1.webp';
  const jsonLdImage = rawImage ? `https://ps15642.com${rawImage.startsWith('/') ? '' : '/'}${rawImage}` : 'https://ps15642.com/hs1.webp';

  const enabledPhotos = gallery
    .filter(item => item.enabled)
    .map(item => ({
      src: `/api/uploads/${item.filename}`,
      thumbUrl: `/api/uploads/${item.filename}`,
      alt: item.filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
      isVideo: false,
    }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.excerpt || '',
    datePublished: data.date || '',
    dateModified: data.date || '',
    image: jsonLdImage,
    url: `https://ps15642.com/projects/${slug}`,
    author: {
      '@type': 'Organization',
      name: 'P&S Contracting and Landscape',
      url: 'https://ps15642.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'P&S Contracting and Landscape',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ps15642.com/logo.png',
      },
    },
    keywords: tags.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero banner */}
      <div
        className="relative w-full"
        style={{
          backgroundImage: `url(${rawImage || '/hs1.webp'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '340px',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 flex flex-col items-center">
          <div className="w-full mt-4 space-y-2">

          <Link href="/projects" className="text-sm text-gray-400 hover:text-lime-700 transition-colors mb-8 inline-block">
          ← All Projects
        </Link>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white text-center drop-shadow-lg leading-tight w-full">
            {data.title}
          </h1>
          <div className="w-full mt-4 space-y-2">
            {data.date && (
              <time className="text-sm text-white/70 block">{data.date}</time>
            )}
            {data.excerpt && (
              <p className="text-base text-white/90 leading-relaxed">{data.excerpt}</p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-white/20 text-white border border-white/40 rounded-full px-3 py-1 backdrop-blur-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        

        {/* <hr className="border-gray-200 mb-8" /> */}

        <MarkdownPreview body={content} />

        {enabledPhotos.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Photos</h2>
            <Gallery images={enabledPhotos} pageSize={12} />
          </section>
        )}
      </div>
    </>
  );
}
