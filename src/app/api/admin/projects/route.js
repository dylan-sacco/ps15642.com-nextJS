import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PROJECTS_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function ensureDir() {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true });
}

// GET /api/admin/projects — list all projects (front matter only)
export async function GET() {
  const { error } = await requireApiPermission('projects.view');
  if (error) return error;

  try {
    ensureDir();
    const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.md'));

    const projects = files.map(file => {
      const slug = file.replace(/\.md$/, '');
      try {
        const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf8');
        const { data } = matter(raw);
        const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map(t => t.trim()).filter(Boolean) : []);
        return { slug, title: data.title || slug, date: data.date || '', excerpt: data.excerpt || '', published: !!data.published, tags, image: data.image || '' };
      } catch {
        return { slug, title: slug, date: '', excerpt: '', published: false };
      }
    });

    projects.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return NextResponse.json({ projects });
  } catch (err) {
    console.error('Projects list error:', err);
    return NextResponse.json({ error: 'Failed to list projects' }, { status: 500 });
  }
}

// POST /api/admin/projects — create project
export async function POST(request) {
  const { user, error } = await requireApiPermission('projects.create');
  if (error) return error;

  try {
    ensureDir();
    const { slug, title, date, excerpt, tags, image, body, gallery, published: wantsPublished } = await request.json();
    const published = wantsPublished && hasPermission(user.role, 'projects.publish');

    if (!slug || !SLUG_RE.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug (lowercase letters, numbers, hyphens only)' },
        { status: 400 }
      );
    }

    const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Project with this slug already exists' }, { status: 409 });
    }

    const frontMatter = {
      title: title || '',
      date: date || new Date().toISOString().slice(0, 10),
      excerpt: excerpt || '',
      published: !!published,
    };
    if (Array.isArray(tags) && tags.length) frontMatter.tags = tags;
    if (image) frontMatter.image = image;
    if (Array.isArray(gallery) && gallery.length) frontMatter.gallery = gallery;

    const fileContent = matter.stringify(body || '', frontMatter);
    fs.writeFileSync(filePath, fileContent, 'utf8');
    return NextResponse.json({ success: true, slug }, { status: 201 });
  } catch (err) {
    console.error('Project create error:', err);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
