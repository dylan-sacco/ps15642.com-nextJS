import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { LOCATIONS_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function ensureDir() {
  fs.mkdirSync(LOCATIONS_DIR, { recursive: true });
}

// GET /api/admin/locations — list all location pages
export async function GET() {
  const { error } = await requireApiPermission('locations.view');
  if (error) return error;

  try {
    ensureDir();
    const files = fs.readdirSync(LOCATIONS_DIR).filter(f => f.endsWith('.md'));

    const locations = files.map(file => {
      const slug = file.replace(/\.md$/, '');
      try {
        const raw = fs.readFileSync(path.join(LOCATIONS_DIR, file), 'utf8');
        const { data } = matter(raw);
        return { slug, heroTitle: data.heroTitle || slug, heroImage: data.heroImage || '' };
      } catch {
        return { slug, heroTitle: slug, heroImage: '' };
      }
    });

    return NextResponse.json({ locations });
  } catch (err) {
    console.error('Locations list error:', err);
    return NextResponse.json({ error: 'Failed to list locations' }, { status: 500 });
  }
}

// POST /api/admin/locations — create location page
export async function POST(request) {
  const { error } = await requireApiPermission('locations.create');
  if (error) return error;

  try {
    ensureDir();
    const { slug, heroTitle, heroImage, metaTitle, metaDescription, body } = await request.json();

    if (!slug || !SLUG_RE.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug (lowercase letters, numbers, hyphens only)' },
        { status: 400 }
      );
    }

    const filePath = path.join(LOCATIONS_DIR, `${slug}.md`);
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'A location with this slug already exists' }, { status: 409 });
    }

    const frontMatter = { heroTitle: heroTitle || '' };
    if (heroImage) frontMatter.heroImage = heroImage;
    if (metaTitle) frontMatter.metaTitle = metaTitle;
    if (metaDescription) frontMatter.metaDescription = metaDescription;

    fs.writeFileSync(filePath, matter.stringify(body || '', frontMatter), 'utf8');
    return NextResponse.json({ success: true, slug }, { status: 201 });
  } catch (err) {
    console.error('Location create error:', err);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}
