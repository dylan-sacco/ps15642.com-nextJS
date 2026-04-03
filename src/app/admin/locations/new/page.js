import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import LocationEditor from '@/components/admin/LocationEditor';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const metadata = { title: 'New Location | Admin' };

export default async function NewLocationPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'locations.create')) {
    return <PermissionDenied permission="locations.create" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Location</h1>
      <LocationEditor isNew={true} />
    </div>
  );
}
