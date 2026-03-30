import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ARTICLES_DIR } from './paths';

/** Convert a display tag to a URL-safe slug: "Lawn Care" → "lawn-care" */
export function tagToSlug(tag) {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Parse a gray-matter tags value into a clean string array */
function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(t => String(t).trim()).filter(Boolean);
  return String(raw).split(',').map(t => t.trim()).filter(Boolean);
}

export function getAllArticles() {
  try {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));

    return files.map(file => {
      const slug = file.replace(/\.md$/, '');
      try {
        const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
        const { data, content } = matter(raw);
        return {
          slug,
          title: data.title || slug,
          date: data.date || '',
          excerpt: data.excerpt || '',
          published: !!data.published,
          tags: parseTags(data.tags),
          image: data.image || '',
          content,
        };
      } catch {
        return { slug, title: slug, date: '', excerpt: '', published: false, tags: [], image: '', content: '' };
      }
    });
  } catch {
    return [];
  }
}

export function getPublishedArticles() {
  return getAllArticles()
    .filter(a => a.published)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

/** Find articles sharing at least one tag with the given slug, sorted by relevance */
export function getRelatedArticles(slug, tags, limit = 3) {
  if (!tags.length) return [];
  const myTagSlugs = new Set(tags.map(tagToSlug));

  return getPublishedArticles()
    .filter(a => a.slug !== slug)
    .map(a => ({
      ...a,
      sharedTags: a.tags.filter(t => myTagSlugs.has(tagToSlug(t))).length,
    }))
    .filter(a => a.sharedTags > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags)
    .slice(0, limit);
}
