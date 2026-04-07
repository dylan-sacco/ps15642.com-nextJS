import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { PROJECTS_DIR } from '@/lib/paths';
import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import ProjectEditor from '@/components/admin/ProjectEditor';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const metadata = { title: 'Edit Project | Admin' };

function parseGallery(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(item => item && typeof item.filename === 'string')
    .map(item => ({ filename: item.filename, enabled: item.enabled !== false }));
}

export default async function EditProjectPage({ params }) {
  const { slug } = await params;

  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'projects.view')) {
    return <PermissionDenied permission="projects.view" />;
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();

  const filePath = path.join(PROJECTS_DIR, `${slug}.md`);
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
    gallery: parseGallery(data.gallery),
    body: content,
  };

  const canPublish = hasPermission(user.role, 'projects.publish');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Project</h1>
      <ProjectEditor initialData={initialData} isNew={false} canPublish={canPublish} />
    </div>
  );
}
