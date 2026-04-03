import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { LOCATIONS_DIR } from '@/lib/paths';
import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Locations | Admin' };

function getLocations() {
  try {
    fs.mkdirSync(LOCATIONS_DIR, { recursive: true });
    return fs.readdirSync(LOCATIONS_DIR)
      .filter(f => f.endsWith('.md'))
      .map(file => {
        const slug = file.replace(/\.md$/, '');
        try {
          const raw = fs.readFileSync(path.join(LOCATIONS_DIR, file), 'utf8');
          const { data } = matter(raw);
          return { slug, heroTitle: data.heroTitle || slug, heroImage: data.heroImage || '' };
        } catch {
          return { slug, heroTitle: slug, heroImage: '' };
        }
      });
  } catch {
    return [];
  }
}

export default async function AdminLocationsPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'locations.view')) {
    return <PermissionDenied permission="locations.view" />;
  }

  const locations = getLocations();
  const canCreate = hasPermission(user.role, 'locations.create');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Locations</h1>
        {canCreate && (
          <Link
            href="/admin/locations/new"
            className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
          >
            + New Location
          </Link>
        )}
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">📍</p>
          <p>No location pages yet.</p>
          {canCreate && (
            <Link href="/admin/locations/new" className="text-lime-600 hover:underline mt-2 inline-block">
              Create your first location page
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {locations.map(loc => (
            <div
              key={loc.slug}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-800 truncate">{loc.heroTitle}</h2>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">/locations/{loc.slug}</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link
                  href={`/admin/locations/${loc.slug}/edit`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Edit
                </Link>
                <Link
                  href={`/locations/${loc.slug}`}
                  target="_blank"
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  View ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
