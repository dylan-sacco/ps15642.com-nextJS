import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { LOCATIONS_DIR } from '@/lib/paths';
import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import LocationEditor from '@/components/admin/LocationEditor';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const metadata = { title: 'Edit Location | Admin' };

export default async function EditLocationPage({ params }) {
  const { slug } = await params;

  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'locations.view')) {
    return <PermissionDenied permission="locations.view" />;
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();

  const filePath = path.join(LOCATIONS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  const initialData = {
    slug,
    heroTitle: data.heroTitle || '',
    heroImage: data.heroImage || '',
    metaTitle: data.metaTitle || '',
    metaDescription: data.metaDescription || '',
    body: content,
  };

  const canDelete = hasPermission(user.role, 'locations.delete');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Location</h1>
      <LocationEditor initialData={initialData} isNew={false} canDelete={canDelete} />
    </div>
  );
}
