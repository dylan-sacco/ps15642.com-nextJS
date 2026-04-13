import { getPublishedPosts } from '@/lib/blog';
import PageHeader from '@/components/PageHeader';
import BlogList from '@/components/blog/BlogList';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog | P&S Contracting and Landscape',
  description: 'Landscaping tips, seasonal guides, and property care insights from P&S Contracting and Landscape — serving Westmoreland County, PA since 2007.',
  alternates: {
    canonical: 'https://ps15642.com/blog',
  },
  openGraph: {
    title: 'Blog | P&S Contracting and Landscape',
    description: 'Landscaping tips, seasonal guides, and property care insights from Westmoreland County, PA.',
    url: 'https://ps15642.com/blog',
    siteName: 'P&S Contracting and Landscape',
    images: [{ url: 'https://ps15642.com/hs1.webp', width: 1800, height: 800, alt: 'P&S Contracting and Landscape Blog' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | P&S Contracting and Landscape',
    description: 'Landscaping tips and seasonal guides from Westmoreland County, PA.',
    images: ['https://ps15642.com/hs1.webp'],
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
