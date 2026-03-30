import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ARTICLES_DIR } from '@/lib/paths';
import { getRelatedArticles, tagToSlug } from '@/lib/articles';
import MarkdownPreview from '@/components/admin/MarkdownPreview';

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(t => String(t).trim()).filter(Boolean);
  return String(raw).split(',').map(t => t.trim()).filter(Boolean);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(raw);
    if (!data.published) return {};
    const ogImage = data.image || 'https://ps15642.com/hs1.webp';
    return {
      title: `${data.title} | P&S Contracting and Landscape`,
      description: data.excerpt || '',
      openGraph: {
        title: data.title,
        description: data.excerpt || '',
        url: `https://ps15642.com/articles/${slug}`,
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

export default async function ArticlePage({ params }) {
  const { slug } = await params;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();

  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  if (!data.published) notFound();

  const tags = parseTags(data.tags);
  const related = getRelatedArticles(slug, tags);
  const ogImage = data.image || 'https://ps15642.com/hs1.webp';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.excerpt || '',
    datePublished: data.date || '',
    dateModified: data.date || '',
    image: ogImage,
    url: `https://ps15642.com/articles/${slug}`,
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
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/articles" className="text-sm text-gray-400 hover:text-lime-700 transition-colors mb-8 inline-block">
        ← All Articles
      </Link>

      <header className="mb-8">
        {data.date && (
          <time className="text-sm text-gray-400 block mb-2">{data.date}</time>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          {data.title}
        </h1>
        {data.excerpt && (
          <p className="text-lg text-gray-600 mt-3 leading-relaxed">{data.excerpt}</p>
        )}

        {/* Tag chips */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map(tag => (
              <Link
                key={tag}
                href={`/articles/tag/${tagToSlug(tag)}`}
                className="text-xs font-medium bg-lime-50 text-lime-700 border border-lime-200 rounded-full px-3 py-1 hover:bg-lime-100 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </header>

      <hr className="border-gray-200 mb-8" />

      <MarkdownPreview body={content} />

      {/* Related articles */}
      {related.length > 0 && (
        <aside className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Related Articles</h2>
          <div className="space-y-4">
            {related.map(article => (
              <div key={article.slug}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="font-medium text-gray-800 hover:text-lime-700 transition-colors"
                >
                  {article.title}
                </Link>
                {article.excerpt && (
                  <p className="text-sm text-gray-500 mt-0.5">{article.excerpt}</p>
                )}
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
