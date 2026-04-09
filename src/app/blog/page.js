import { getPublishedPosts } from '@/lib/blog';
import PageHeader from '@/components/PageHeader';
import BlogList from '@/components/blog/BlogList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog | P&S Contracting and Landscape',
  description: 'Tips, guides, and insights on landscaping and property care from P&S Contracting and Landscape.',
  openGraph: {
    title: 'Blog | P&S Contracting and Landscape',
    description: 'Landscaping tips, guides, and insights.',
    url: 'https://ps15642.com/blog',
    siteName: 'P&S Contracting and Landscape',
    images: [{ url: 'https://ps15642.com/hs1.webp', width: 1800, height: 800 }],
    locale: 'en_US',
    type: 'website',
  },
};

export default function BlogPage() {
  const blog = getPublishedPosts();

  return (
    <div>
      <PageHeader title="Blog" subtitle="Landscaping Tips &amp; Insights" />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <BlogList posts={blog} />
      </div>
    </div>
  );
}
