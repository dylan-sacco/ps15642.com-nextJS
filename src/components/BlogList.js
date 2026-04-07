'use client';
import { useState } from 'react';
import BlogListItem from '@/components/BlogListItem';

const PAGE_SIZE = 10;

export default function BlogList({ posts }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visiblePosts = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  if (posts.length === 0) {
    return (
      <p className="text-gray-500 text-center py-16">No posts published yet. Check back soon!</p>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {visiblePosts.map(article => (
          <BlogListItem key={article.slug} article={article} />
        ))}
      </div>

      {posts.length > 0 && (
        <div className="flex flex-col items-center gap-3 pt-8">
          <p className="text-sm text-gray-400">
            Showing {Math.min(visibleCount, posts.length)} of {posts.length}
          </p>
          {hasMore && (
            <button
              onClick={() => setVisibleCount(c => Math.min(c + PAGE_SIZE, posts.length))}
              className="px-6 py-2 bg-lime-600 hover:bg-lime-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </>
  );
}
