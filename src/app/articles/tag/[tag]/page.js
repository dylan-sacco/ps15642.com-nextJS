import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedArticles, tagToSlug } from '@/lib/articles';
import H1Drop from '@/components/H1Drop';
import ParallaxCard from '@/components/ParallaxCard';

export async function generateMetadata({ params }) {
  const { tag: tagSlug } = await params;
  const articles = getPublishedArticles();
  const displayTag = findDisplayTag(articles, tagSlug);
  if (!displayTag) return {};

  return {
    title: `${displayTag} Articles | P&S Contracting and Landscape`,
    description: `Landscaping and property care articles about ${displayTag} from P&S Contracting and Landscape.`,
  };
}

function findDisplayTag(articles, tagSlug) {
  for (const article of articles) {
    for (const tag of article.tags) {
      if (tagToSlug(tag) === tagSlug) return tag;
    }
  }
  return null;
}

export default async function TagPage({ params }) {
  const { tag: tagSlug } = await params;

  const allPublished = getPublishedArticles();
  const displayTag = findDisplayTag(allPublished, tagSlug);

  if (!displayTag) notFound();

  const articles = allPublished.filter(a =>
    a.tags.some(t => tagToSlug(t) === tagSlug)
  );

  return (
    <div>
      <ParallaxCard>
        <H1Drop color="text-white" size="text-4xl md:text-5xl">
          {displayTag}
        </H1Drop>
      </ParallaxCard>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/articles" className="text-sm text-gray-400 hover:text-lime-700 transition-colors">
            ← All Articles
          </Link>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">{articles.length} article{articles.length !== 1 ? 's' : ''} tagged "{displayTag}"</span>
        </div>

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
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {article.tags.map(tag => (
                    <Link
                      key={tag}
                      href={`/articles/tag/${tagToSlug(tag)}`}
                      className={`text-xs rounded-full px-2.5 py-0.5 border transition-colors ${
                        tagToSlug(tag) === tagSlug
                          ? 'bg-lime-600 text-white border-lime-600'
                          : 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100'
                      }`}
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
      </div>
    </div>
  );
}
