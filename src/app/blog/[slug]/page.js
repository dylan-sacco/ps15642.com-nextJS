import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BLOGS_DIR } from '@/lib/paths';
import { getRelatedPosts, getAdjacentPosts, tagToSlug, readingTime } from '@/lib/blog';
import MarkdownPreview from '@/components/admin/MarkdownPreview';
import ShareButton from '@/components/ShareButton';

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(t => String(t).trim()).filter(Boolean);
  return String(raw).split(',').map(t => t.trim()).filter(Boolean);
}

function isScheduled(date) {
  if (!date) return false;
  const today = new Date().toISOString().split('T')[0];
  return date > today;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const filePath = path.join(BLOGS_DIR, `${slug}.md`);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(raw);
    if (!data.published || isScheduled(data.date)) return {};
    const ogImage = data.image || 'https://ps15642.com/hs1.webp';
    return {
      title: `${data.title} | P&S Contracting and Landscape`,
      description: data.excerpt || '',
      openGraph: {
        title: data.title,
        description: data.excerpt || '',
        url: `https://ps15642.com/blog/${slug}`,
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

function PostNav({ prev, next }) {
  if (!prev && !next) return null;
  return (
    <nav className="flex items-stretch gap-3">
      <div className="flex-1">
        {prev && (
          <Link
            href={`/blog/${prev.slug}`}
            className="flex flex-col h-full p-3 rounded-lg border border-gray-200 hover:border-lime-400 hover:bg-gray-50 transition-colors group"
          >
            <span className="text-xs text-gray-400 mb-1">← Older</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-lime-700 transition-colors line-clamp-2">
              {prev.title}
            </span>
          </Link>
        )}
      </div>
      <div className="flex-1 flex justify-end">
        {next && (
          <Link
            href={`/blog/${next.slug}`}
            className="flex flex-col h-full w-full p-3 rounded-lg border border-gray-200 hover:border-lime-400 hover:bg-gray-50 transition-colors group text-right"
          >
            <span className="text-xs text-gray-400 mb-1">Newer →</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-lime-700 transition-colors line-clamp-2">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();

  const filePath = path.join(BLOGS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  if (!data.published || isScheduled(data.date)) notFound();

  const tags = parseTags(data.tags);
  const related = getRelatedPosts(slug, tags);
  const { prev, next } = getAdjacentPosts(slug);
  const minutes = readingTime(content);
  const ogImage = data.image || 'https://ps15642.com/hs1.webp';
  const postUrl = `https://ps15642.com/blog/${slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.excerpt || '',
    datePublished: data.date || '',
    dateModified: data.date || '',
    image: ogImage,
    url: postUrl,
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

      {/* Top nav row */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/blog" className="text-sm text-gray-400 hover:text-lime-700 transition-colors">
          ← All Posts
        </Link>
        <ShareButton url={postUrl} />
      </div>

      {/* Top prev/next */}
      <div className="mb-8">
        <PostNav prev={prev} next={next} />
      </div>

      <header className="mb-8">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {data.date && (
            <time className="text-sm text-gray-400">{data.date}</time>
          )}
          <span className="text-sm text-gray-400">· {minutes} min read</span>
        </div>

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
                href={`/blog/tag/${tagToSlug(tag)}`}
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

      {/* Bottom prev/next */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <PostNav prev={prev} next={next} />
      </div>

      {/* Share */}
      <div className="flex justify-center mt-6">
        <ShareButton url={postUrl} />
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <aside className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Related Posts</h2>
          <div className="space-y-4">
            {related.map(article => (
              <div key={article.slug}>
                <Link
                  href={`/blog/${article.slug}`}
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
