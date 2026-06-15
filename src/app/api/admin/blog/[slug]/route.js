import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BLOGS_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import { generateBlogSitemaps } from '@/lib/sitemap';

function safeSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// GET /api/admin/blog/[slug]
export async function GET(request, { params }) {
  const { error } = await requireApiPermission('blog.view');
  if (error) return error;

  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(BLOGS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return NextResponse.json({ slug, ...data, body: content });
}

// PUT /api/admin/blog/[slug]
export async function PUT(request, { params }) {
  // Minimum required to edit anything
  const { user, error } = await requireApiPermission('blog.edit.draft');
  if (error) return error;

  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(BLOGS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const { title, date, excerpt, tags, image, body, published: wantsPublished, newSlug } = await request.json();

    // Read current state to enforce granular permissions
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data: current } = matter(raw);
    const currentlyPublished = !!current.published;

    if (currentlyPublished && !hasPermission(user.role, 'blog.edit.published')) {
      return NextResponse.json({ error: 'Your role cannot edit published articles' }, { status: 403 });
    }

    // Determine final published state
    let published;
    if (wantsPublished !== currentlyPublished) {
      // Changing publish state requires blog.publish
      if (!hasPermission(user.role, 'blog.publish')) {
        published = currentlyPublished; // silently preserve current state
      } else {
        published = !!wantsPublished;
      }
    } else {
      published = currentlyPublished;
    }
    const frontMatter = {
      title: title || '',
      date: date || '',
      excerpt: excerpt || '',
      published: !!published,
    };
    if (Array.isArray(tags) && tags.length) frontMatter.tags = tags;
    if (image) frontMatter.image = image;
    const fileContent = matter.stringify(body || '', frontMatter);

    // Handle slug rename
    if (newSlug && newSlug !== slug) {
      if (!safeSlug(newSlug)) {
        return NextResponse.json({ error: 'Invalid new slug' }, { status: 400 });
      }
      const newFilePath = path.join(BLOGS_DIR, `${newSlug}.md`);
      if (fs.existsSync(newFilePath)) {
        return NextResponse.json({ error: `Slug "${newSlug}" is already taken` }, { status: 409 });
      }
      fs.writeFileSync(newFilePath, fileContent, 'utf8');
      fs.unlinkSync(filePath);
      try { generateBlogSitemaps(); } catch (e) { console.error('Sitemap update failed:', e); }
      return NextResponse.json({ success: true, newSlug });
    }

    fs.writeFileSync(filePath, fileContent, 'utf8');
    try { generateBlogSitemaps(); } catch (e) { console.error('Sitemap update failed:', e); }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Article update error:', err);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE /api/admin/blog/[slug]
export async function DELETE(request, { params }) {
  const { error } = await requireApiPermission('blog.delete');
  if (error) return error;

  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(BLOGS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  fs.unlinkSync(filePath);
  try { generateBlogSitemaps(); } catch (e) { console.error('Sitemap update failed:', e); }
  return NextResponse.json({ success: true });
}
