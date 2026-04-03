'use client';
import Link from 'next/link';
import { useState } from 'react';

const PAGE_SIZE = 10;

export default function BlogList({ posts, tagToSlug }) {
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
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {article.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tagToSlug(tag)}`}
                    className="text-xs bg-lime-50 text-lime-700 border border-lime-200 rounded-full px-2.5 py-0.5 hover:bg-lime-100 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
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
