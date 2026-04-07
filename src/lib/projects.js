import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PROJECTS_DIR } from './paths';

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(t => String(t).trim()).filter(Boolean);
  return String(raw).split(',').map(t => t.trim()).filter(Boolean);
}

function parseGallery(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(item => item && typeof item.filename === 'string')
    .map(item => ({ filename: item.filename, enabled: item.enabled !== false }));
}

export function getAllProjects() {
  try {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
    const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.md'));

    return files.map(file => {
      const slug = file.replace(/\.md$/, '');
      try {
        const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf8');
        const { data, content } = matter(raw);
        return {
          slug,
          title: data.title || slug,
          date: data.date || '',
          excerpt: data.excerpt || '',
          published: !!data.published,
          tags: parseTags(data.tags),
          image: data.image || '',
          gallery: parseGallery(data.gallery),
          content,
        };
      } catch {
        return { slug, title: slug, date: '', excerpt: '', published: false, tags: [], image: '', gallery: [], content: '' };
      }
    });
  } catch {
    return [];
  }
}

export function getPublishedProjects() {
  return getAllProjects()
    .filter(p => p.published)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}
