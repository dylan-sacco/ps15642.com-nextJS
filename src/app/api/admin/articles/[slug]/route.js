import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { ARTICLES_DIR } from '@/lib/paths';

function safeSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// GET /api/admin/articles/[slug]
export async function GET(request, { params }) {
  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return NextResponse.json({ slug, ...data, body: content });
}

// PUT /api/admin/articles/[slug]
export async function PUT(request, { params }) {
  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const { title, date, excerpt, tags, image, published, body } = await request.json();
    const frontMatter = {
      title: title || '',
      date: date || '',
      excerpt: excerpt || '',
      published: !!published,
    };
    if (Array.isArray(tags) && tags.length) frontMatter.tags = tags;
    if (image) frontMatter.image = image;
    const fileContent = matter.stringify(body || '', frontMatter);
    fs.writeFileSync(filePath, fileContent, 'utf8');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Article update error:', err);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE /api/admin/articles/[slug]
export async function DELETE(request, { params }) {
  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  fs.unlinkSync(filePath);
  return NextResponse.json({ success: true });
}
