import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BLOGS_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function ensureDir() {
  fs.mkdirSync(BLOGS_DIR, { recursive: true });
}

// GET /api/admin/blog — list all articles (front matter only)
export async function GET() {
  const { error } = await requireApiPermission('blog.view');
  if (error) return error;

  try {
    ensureDir();
    const files = fs.readdirSync(BLOGS_DIR).filter(f => f.endsWith('.md'));

    const articles = files.map(file => {
      const slug = file.replace(/\.md$/, '');
      try {
        const raw = fs.readFileSync(path.join(BLOGS_DIR, file), 'utf8');
        const { data } = matter(raw);
        const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map(t => t.trim()).filter(Boolean) : []);
        return { slug, title: data.title || slug, date: data.date || '', excerpt: data.excerpt || '', published: !!data.published, tags, image: data.image || '' };
      } catch {
        return { slug, title: slug, date: '', excerpt: '', published: false };
      }
    });

    blog.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return NextResponse.json({ articles });
  } catch (err) {
    console.error('Articles list error:', err);
    return NextResponse.json({ error: 'Failed to list articles' }, { status: 500 });
  }
}

// POST /api/admin/blog — create article
export async function POST(request) {
  const { user, error } = await requireApiPermission('blog.create');
  if (error) return error;

  try {
    ensureDir();
    const { slug, title, date, excerpt, tags, image, body, published: wantsPublished } = await request.json();
    // Strip publish flag if caller lacks permission
    const published = wantsPublished && hasPermission(user.role, 'blog.publish');

    if (!slug || !SLUG_RE.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug (lowercase letters, numbers, hyphens only)' },
        { status: 400 }
      );
    }

    const filePath = path.join(BLOGS_DIR, `${slug}.md`);
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
