import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { BLOGS_DIR } from '@/lib/paths';
import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import BlogEditor from '@/components/admin/BlogEditor';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const metadata = { title: 'Edit Post | Admin' };

export default async function EditBlogPage({ params }) {
  const { slug } = await params;

  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'blog.view')) {
    return <PermissionDenied permission="blog.view" />;
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();

  const filePath = path.join(BLOGS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  const tags = Array.isArray(data.tags)
    ? data.tags
    : data.tags ? String(data.tags).split(',').map(t => t.trim()).filter(Boolean) : [];

  const initialData = {
    slug,
    title: data.title || '',
    date: data.date || '',
    excerpt: data.excerpt || '',
    tags,
    image: data.image || '',
    published: !!data.published,
    body: content,
  };

  const canPublish = hasPermission(user.role, 'blog.publish');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Post</h1>
      <BlogEditor initialData={initialData} isNew={false} canPublish={canPublish} />
    </div>
  );
}
