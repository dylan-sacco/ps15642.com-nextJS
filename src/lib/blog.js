import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BLOGS_DIR } from './paths';

/** Convert a display tag to a URL-safe slug: "Lawn Care" → "lawn-care" */
export function tagToSlug(tag) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Estimated reading time in minutes at 180 wpm (moderate reading ability) */
export function readingTime(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

/** Parse a gray-matter tags value into a clean string array */
function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(t => String(t).trim()).filter(Boolean);
  return String(raw).split(',').map(t => t.trim()).filter(Boolean);
}

export function getAllPosts() {
  try {
    fs.mkdirSync(BLOGS_DIR, { recursive: true });
    const files = fs.readdirSync(BLOGS_DIR).filter(f => f.endsWith('.md'));

    return files.map(file => {
      const slug = file.replace(/\.md$/, '');
      try {
        const raw = fs.readFileSync(path.join(BLOGS_DIR, file), 'utf8');
        const { data, content } = matter(raw);
        return {
          slug,
          title: data.title || slug,
          date: data.date || '',
          excerpt: data.excerpt || '',
          published: !!data.published,
          featured: !!data.featured,
          tags: parseTags(data.tags),
          image: data.image || '',
          readingTime: readingTime(content),
          content,
        };
      } catch {
        return { slug, title: slug, date: '', excerpt: '', published: false, featured: false, tags: [], image: '', readingTime: 1, content: '' };
      }
    });
  } catch {
    return [];
  }
}

export function getPublishedPosts() {
  const today = new Date().toISOString().split('T')[0];
  return getAllPosts()
    .filter(a => a.published && (!a.date || a.date <= today))
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (b.date || '').localeCompare(a.date || '');
    });
}

/** Returns the previous (older) and next (newer) published posts relative to slug */
export function getAdjacentPosts(slug) {
  const posts = getPublishedPosts();
  const idx = posts.findIndex(p => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx < posts.length - 1 ? posts[idx + 1] : null,
    next: idx > 0 ? posts[idx - 1] : null,
  };
}

/** Find articles sharing at least one tag with the given slug, sorted by relevance */
export function getRelatedPosts(slug, tags, limit = 3) {
  if (!tags.length) return [];
  const myTagSlugs = new Set(tags.map(tagToSlug));

  return getPublishedPosts()
    .filter(a => a.slug !== slug)
    .map(a => ({
      ...a,
      sharedTags: a.tags.filter(t => myTagSlugs.has(tagToSlug(t))).length,
    }))
    .filter(a => a.sharedTags > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags)
    .slice(0, limit);
}
