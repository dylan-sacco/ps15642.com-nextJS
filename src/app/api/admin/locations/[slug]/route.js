import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { LOCATIONS_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';
import { generateLocationsSitemap } from '@/lib/sitemap';

function safeSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

// GET /api/admin/locations/[slug]
export async function GET(request, { params }) {
  const { error } = await requireApiPermission('locations.view');
  if (error) return error;

  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(LOCATIONS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  return NextResponse.json({ slug, ...data, body: content });
}

// PUT /api/admin/locations/[slug]
export async function PUT(request, { params }) {
  const { error } = await requireApiPermission('locations.edit');
  if (error) return error;

  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(LOCATIONS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const { heroTitle, heroImage, metaTitle, metaDescription, body, newSlug } = await request.json();

    const frontMatter = { heroTitle: heroTitle || '' };
    if (heroImage) frontMatter.heroImage = heroImage;
    if (metaTitle) frontMatter.metaTitle = metaTitle;
    if (metaDescription) frontMatter.metaDescription = metaDescription;

    const fileContent = matter.stringify(body || '', frontMatter);

    if (newSlug && newSlug !== slug) {
      if (!safeSlug(newSlug)) return NextResponse.json({ error: 'Invalid new slug' }, { status: 400 });
      const newFilePath = path.join(LOCATIONS_DIR, `${newSlug}.md`);
      if (fs.existsSync(newFilePath)) {
        return NextResponse.json({ error: `Slug "${newSlug}" is already taken` }, { status: 409 });
      }
      fs.writeFileSync(newFilePath, fileContent, 'utf8');
      fs.unlinkSync(filePath);
      try { generateLocationsSitemap(); } catch (e) { console.error('Sitemap update failed:', e); }
      return NextResponse.json({ success: true, newSlug });
    }

    fs.writeFileSync(filePath, fileContent, 'utf8');
    try { generateLocationsSitemap(); } catch (e) { console.error('Sitemap update failed:', e); }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Location update error:', err);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

// DELETE /api/admin/locations/[slug]
export async function DELETE(request, { params }) {
  const { error } = await requireApiPermission('locations.delete');
  if (error) return error;

  const { slug } = await params;
  if (!safeSlug(slug)) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

  const filePath = path.join(LOCATIONS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  fs.unlinkSync(filePath);
  try { generateLocationsSitemap(); } catch (e) { console.error('Sitemap update failed:', e); }
  return NextResponse.json({ success: true });
}
