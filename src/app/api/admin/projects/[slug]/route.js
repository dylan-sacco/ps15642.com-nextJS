import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PROJECTS_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';

function safeSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// GET /api/admin/projects/[slug]
export async function GET(request, { params }) {
  const { error } = await requireApiPermission('projects.view');
  if (error) return error;

  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return NextResponse.json({ slug, ...data, body: content });
}

// PUT /api/admin/projects/[slug]
export async function PUT(request, { params }) {
  const { user, error } = await requireApiPermission('projects.edit.draft');
  if (error) return error;

  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const { title, date, excerpt, tags, image, body, gallery, published: wantsPublished, newSlug } = await request.json();

    const raw = fs.readFileSync(filePath, 'utf8');
    const { data: current } = matter(raw);
    const currentlyPublished = !!current.published;

    if (currentlyPublished && !hasPermission(user.role, 'projects.edit.published')) {
      return NextResponse.json({ error: 'Your role cannot edit published projects' }, { status: 403 });
    }

    let published;
    if (wantsPublished !== currentlyPublished) {
      published = hasPermission(user.role, 'projects.publish') ? !!wantsPublished : currentlyPublished;
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
    if (Array.isArray(gallery) && gallery.length) frontMatter.gallery = gallery;

    const fileContent = matter.stringify(body || '', frontMatter);

    if (newSlug && newSlug !== slug) {
      if (!safeSlug(newSlug)) {
        return NextResponse.json({ error: 'Invalid new slug' }, { status: 400 });
      }
      const newFilePath = path.join(PROJECTS_DIR, `${newSlug}.md`);
      if (fs.existsSync(newFilePath)) {
        return NextResponse.json({ error: `Slug "${newSlug}" is already taken` }, { status: 409 });
      }
      fs.writeFileSync(newFilePath, fileContent, 'utf8');
      fs.unlinkSync(filePath);
      return NextResponse.json({ success: true, newSlug });
    }

    fs.writeFileSync(filePath, fileContent, 'utf8');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Project update error:', err);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE /api/admin/projects/[slug]
export async function DELETE(request, { params }) {
  const { error } = await requireApiPermission('projects.delete');
  if (error) return error;

  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  fs.unlinkSync(filePath);
  return NextResponse.json({ success: true });
}
