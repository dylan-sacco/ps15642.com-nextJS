

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BLOGS_DIR } from '@/lib/paths';
import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import PermissionDenied from '@/components/admin/PermissionDenied';
import RenderBlogs from '@/components/admin/RenderBlogs';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Blog | Admin' };

function getBlogs() {

  try {
    fs.mkdirSync(BLOGS_DIR, { recursive: true });
    const files = fs.readdirSync(BLOGS_DIR).filter(f => f.endsWith('.md'));

    return files
      .map(file => {
        const slug = file.replace(/\.md$/, '');
        try {
          const filePath = path.join(BLOGS_DIR, file);
          const raw = fs.readFileSync(filePath, 'utf8');
          const { data, content } = matter(raw);
          const mtime = fs.statSync(filePath).mtimeMs;
          const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
          return { slug, title: data.title || slug, date: data.date || '', excerpt: data.excerpt || '', published: !!data.published, featured: !!data.featured, mtime, wordCount };
        } catch {
          return { slug, title: slug, date: '', excerpt: '', published: false, featured: false, mtime: 0, wordCount: 0 };
        }
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch {
    return [];
  }
}

export default async function AdminBlogPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'blog.view')) {
    return <PermissionDenied permission="blog.view" />;
  }

  const blogs = getBlogs();

  return (
      <RenderBlogs blogs={blogs} user={user} />
  );
}
