import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PROJECTS_DIR } from '@/lib/paths';
import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import PermissionDenied from '@/components/admin/PermissionDenied';
import RenderProjects from '@/components/admin/RenderProjects';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Projects | Admin' };

function getProjects() {
  try {
    fs.mkdirSync(PROJECTS_DIR, { recursive: true });
    const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith('.md'));

    return files
      .map(file => {
        const slug = file.replace(/\.md$/, '');
        try {
          const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf8');
          const { data } = matter(raw);
          return { slug, title: data.title || slug, date: data.date || '', excerpt: data.excerpt || '', published: !!data.published };
        } catch {
          return { slug, title: slug, date: '', excerpt: '', published: false };
        }
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch {
    return [];
  }
}

export default async function AdminProjectsPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'projects.view')) {
    return <PermissionDenied permission="projects.view" />;
  }

  const projects = getProjects();

  return <RenderProjects projects={projects} user={user} />;
}
