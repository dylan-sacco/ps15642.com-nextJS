import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedPosts, tagToSlug } from '@/lib/blog';
import H1Drop from '@/components/H1Drop';
import ParallaxCard from '@/components/ParallaxCard';
import TagsLinked from '@/components/blog/Tags';

export async function generateMetadata({ params }) {
  const { tag: tagSlug } = await params;
  const blogs = getPublishedPosts();
  const displayTag = findDisplayTag(blogs, tagSlug);
  if (!displayTag) return {};

  return {
    title: `${displayTag} Blog | P&S Contracting and Landscape`,
    description: `Landscaping and property care posts about ${displayTag} from P&S Contracting and Landscape.`,
  };
}

function findDisplayTag(blogs, tagSlug) {
  for (const blog of blogs) {
    for (const tag of blog.tags) {
      if (tagToSlug(tag) === tagSlug) return tag;
    }
  }
  return null;
}

export default async function TagPage({ params }) {
  const { tag: tagSlug } = await params;

  const allPublished = getPublishedPosts();
  const displayTag = findDisplayTag(allPublished, tagSlug);

  if (!displayTag) notFound();

  const blog = allPublished.filter(a =>
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
          <Link href="/blog" className="text-sm text-gray-400 hover:text-lime-700 transition-colors">
            ← All Posts
          </Link>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-500">{blog.length} post{blog.length !== 1 ? 's' : ''} tagged "{displayTag}"</span>
        </div>

        <div className="space-y-8">
          {blog.map(article => (
            <article key={article.slug} className="border-b border-gray-200 pb-8 last:border-0">
              {article.date && (
                <time className="text-sm text-gray-400">{article.date}</time>
              )}
              <h2 className="text-xl font-bold text-gray-800 mt-1 mb-2">
                <Link href={`/blog/${article.slug}`} className="hover:text-lime-700 transition-colors">
                  {article.title}
                </Link>
              </h2>
              {article.excerpt && (
                <p className="text-gray-600 leading-relaxed">{article.excerpt}</p>
              )}
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <TagsLinked tags={article.tags} invert selected={tagSlug} />
                </div>
              )}
              <Link
                href={`/blog/${article.slug}`}
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
