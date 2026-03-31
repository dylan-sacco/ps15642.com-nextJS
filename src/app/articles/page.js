import Link from 'next/link';
import { getPublishedArticles, tagToSlug } from '@/lib/articles';
import H1Drop from '@/components/H1Drop';
import ParallaxCard from '@/components/ParallaxCard';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Articles | P&S Contracting and Landscape',
  description: 'Tips, guides, and insights on landscaping and property care from P&S Contracting and Landscape.',
  openGraph: {
    title: 'Articles | P&S Contracting and Landscape',
    description: 'Landscaping tips, guides, and insights.',
    url: 'https://ps15642.com/articles',
    siteName: 'P&S Contracting and Landscape',
    images: [{ url: 'https://ps15642.com/hs1.webp', width: 1800, height: 800 }],
    locale: 'en_US',
    type: 'website',
  },
};

export default function ArticlesPage() {
  const articles = getPublishedArticles();

  return (
    <div>
      <ParallaxCard>
        <H1Drop color="text-white" size="text-4xl md:text-6xl">
          Articles
        </H1Drop>
      </ParallaxCard>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {articles.length === 0 ? (
          <p className="text-gray-500 text-center py-16">No articles published yet. Check back soon!</p>
        ) : (
          <div className="space-y-8">
            {articles.map(article => (
              <article key={article.slug} className="border-b border-gray-200 pb-8 last:border-0">
                {article.date && (
                  <time className="text-sm text-gray-400">{article.date}</time>
                )}
                <h2 className="text-xl font-bold text-gray-800 mt-1 mb-2">
                  <Link href={`/articles/${article.slug}`} className="hover:text-lime-700 transition-colors">
                    {article.title}
                  </Link>
                </h2>
                {article.excerpt && (
                  <p className="text-gray-600 leading-relaxed">{article.excerpt}</p>
                )}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {article.tags.map(tag => (
                      <Link
                        key={tag}
                        href={`/articles/tag/${tagToSlug(tag)}`}
                        className="text-xs bg-lime-50 text-lime-700 border border-lime-200 rounded-full px-2.5 py-0.5 hover:bg-lime-100 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  href={`/articles/${article.slug}`}
                  className="inline-block mt-3 text-sm font-medium text-lime-700 hover:text-lime-900 transition-colors"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
