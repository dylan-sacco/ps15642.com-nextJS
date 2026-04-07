import Link from 'next/link';

function tagToSlug(tag) {
  return tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * A single tag chip that links to /blog/tag/[slug].
 * @param {string}  tag        - Display label for the tag
 * @param {string}  [activeSlug] - If provided, the chip matching this slug gets the active (filled) style
 */
export default function TagChip({ tag, activeSlug }) {
  const slug = tagToSlug(tag);
  const isActive = activeSlug && slug === activeSlug;

  return (
    <Link
      href={`/blog/tag/${slug}`}
      className={`text-xs font-medium rounded-full px-2.5 py-0.5 border transition-all duration-150 hover:scale-110 origin-center ${
        isActive
          ? 'bg-lime-600 text-white border-lime-600'
          : 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100'
      }`}
    >
      {tag}
    </Link>
  );
}
