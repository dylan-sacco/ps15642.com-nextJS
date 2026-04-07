import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedPosts, tagToSlug } from '@/lib/blog';
import BlogListItem from '@/components/BlogListItem';
import H1Drop from '@/components/H1Drop';
import ParallaxCard from '@/components/ParallaxCard';

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
            <BlogListItem key={article.slug} article={article} activeTagSlug={tagSlug} />
          ))}
        </div>
      </div>
    </div>
  );
}
