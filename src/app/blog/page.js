import { getPublishedPosts } from '@/lib/blog';
import H1Drop from '@/components/H1Drop';
import ParallaxCard from '@/components/ParallaxCard';
import BlogList from '@/components/BlogList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog | P&S Contracting and Landscape',
  description: 'Tips, guides, and insights on landscaping and property care from P&S Contracting and Landscape.',
  openGraph: {
    title: 'Blog | P&S Contracting and Landscape',
    description: 'Landscaping tips, guides, and insights.',
    url: '/blog',
    siteName: 'P&S Contracting and Landscape',
    images: [{ url: '/hs1.webp', width: 1800, height: 800 }],
    locale: 'en_US',
    type: 'website',
  },
};

export default function BlogPage() {
  const blog = getPublishedPosts();

  return (
    <div>
      <ParallaxCard>
        <H1Drop color="text-white" size="text-4xl md:text-6xl">
          Blogs
        </H1Drop>
      </ParallaxCard>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <BlogList posts={blog} />
      </div>
    </div>
  );
}
