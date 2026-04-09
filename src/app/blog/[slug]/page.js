import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BLOGS_DIR } from '@/lib/paths';
import { getRelatedPosts } from '@/lib/blog';
import MarkdownPreview from '@/components/admin/MarkdownPreview';
import BlogPostHeader from '@/components/blog/PostHeader';
import PostHeader from '@/components/blog/PostHeader';

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(t => String(t).trim()).filter(Boolean);
  return String(raw).split(',').map(t => t.trim()).filter(Boolean);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const filePath = path.join(BLOGS_DIR, `${slug}.md`);
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

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();

  const filePath = path.join(BLOGS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  if (!data.published) notFound();

  const tags = parseTags(data.tags);
  const related = getRelatedPosts(slug, tags);
  const ogImage = data.image || 'https://ps15642.com/hs1.webp';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.excerpt || '',
    datePublished: data.date || '',
    dateModified: data.date || '',
    image: ogImage,
    url: `https://ps15642.com/blog/${slug}`,
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
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Adaptive hero — full-bleed image if the post has one, clean typography if not */}
      <PostHeader
        title={data.title}
        date={data.date || null}
        tags={tags}
        excerpt={data.excerpt || null}
        imageUrl={data.image || null}
      />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <MarkdownPreview body={content} />

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
    </div>
  );
}
