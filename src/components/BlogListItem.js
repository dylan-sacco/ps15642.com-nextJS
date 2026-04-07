import Link from 'next/link';
import TagChip from '@/components/TagChip';

/**
 * A single blog list item.
 *
 * @param {object}  article         - Post data: { slug, title, date, excerpt, tags }
 * @param {boolean} [minimal=false] - Minimal view: title + excerpt only (e.g. related posts)
 * @param {string}  [activeTagSlug] - Highlight the matching tag chip (tag listing pages)
 */
export default function BlogListItem({ article, minimal = false, activeTagSlug }) {
  if (minimal) {
    return (
      <div>
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
    );
  }

  return (
    <article className="relative border-b border-gray-200 pb-8 last:border-0 hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors cursor-pointer">
      {article.date && (
        <time className="text-sm text-gray-400">{article.date}</time>
      )}
      <h2 className="text-xl font-bold text-gray-800 mt-1 mb-2">
        <Link
          href={`/blog/${article.slug}`}
          className="hover:text-lime-700 transition-colors after:absolute after:inset-0 after:rounded-lg"
        >
          {article.title}
        </Link>
      </h2>
      {article.excerpt && (
        <p className="text-gray-600 leading-relaxed">{article.excerpt}</p>
      )}
      {article.tags && article.tags.length > 0 && (
        <div className="relative z-10 flex flex-wrap gap-1.5 mt-3">
          {article.tags.map(tag => (
            <TagChip key={tag} tag={tag} activeSlug={activeTagSlug} />
          ))}
        </div>
      )}
      <Link
        href={`/blog/${article.slug}`}
        className="relative z-10 inline-block mt-3 text-sm font-medium text-lime-700 hover:text-lime-900 transition-colors"
      >
        Read more →
      </Link>
    </article>
  );
}
