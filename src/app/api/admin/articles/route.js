import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ARTICLES_DIR } from '@/lib/paths';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function ensureDir() {
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
}

// GET /api/admin/articles — list all articles (front matter only)
export async function GET() {
  try {
    ensureDir();
    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));

    const articles = files.map(file => {
      const slug = file.replace(/\.md$/, '');
      try {
        const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
        const { data } = matter(raw);
        const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map(t => t.trim()).filter(Boolean) : []);
        return { slug, title: data.title || slug, date: data.date || '', excerpt: data.excerpt || '', published: !!data.published, tags, image: data.image || '' };
      } catch {
        return { slug, title: slug, date: '', excerpt: '', published: false };
      }
    });

    articles.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return NextResponse.json({ articles });
  } catch (err) {
    console.error('Articles list error:', err);
    return NextResponse.json({ error: 'Failed to list articles' }, { status: 500 });
  }
}

// POST /api/admin/articles — create article
export async function POST(request) {
  try {
    ensureDir();
    const { slug, title, date, excerpt, tags, image, published, body } = await request.json();

    if (!slug || !SLUG_RE.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug (lowercase letters, numbers, hyphens only)' },
        { status: 400 }
      );
    }

    const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Article with this slug already exists' }, { status: 409 });
    }

    const frontMatter = {
      title: title || '',
      date: date || new Date().toISOString().slice(0, 10),
      excerpt: excerpt || '',
      published: !!published,
    };
    if (Array.isArray(tags) && tags.length) frontMatter.tags = tags;
    if (image) frontMatter.image = image;

    const fileContent = matter.stringify(body || '', frontMatter);

    fs.writeFileSync(filePath, fileContent, 'utf8');
    return NextResponse.json({ success: true, slug }, { status: 201 });
  } catch (err) {
    console.error('Article create error:', err);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
