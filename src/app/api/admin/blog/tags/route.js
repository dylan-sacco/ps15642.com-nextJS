import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BLOGS_DIR } from '@/lib/paths';
import { requireApiPermission } from '@/lib/adminAuth';

export async function GET() {
  const { error } = await requireApiPermission('blog.view');
  if (error) return error;

  const tagSet = new Set();
  try {
    const files = fs.readdirSync(BLOGS_DIR).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const { data } = matter(fs.readFileSync(path.join(BLOGS_DIR, file), 'utf8'));
      const tags = Array.isArray(data.tags)
        ? data.tags
        : data.tags ? String(data.tags).split(',').map(t => t.trim()).filter(Boolean) : [];
      tags.forEach(t => { if (t) tagSet.add(t); });
    }
  } catch { /* no blog dir */ }

  return NextResponse.json([...tagSet].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
}
