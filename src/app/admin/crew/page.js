import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import { readCrew } from '@/lib/crew';
import CrewManager from '@/components/admin/CrewManager';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const metadata = { title: 'Crew / Meet the Team | Admin' };

export default async function AdminCrewPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'crew.view')) {
    return <PermissionDenied permission="crew.view" />;
  }

  const canManage = hasPermission(user.role, 'crew.manage');
  const data = readCrew();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Meet the Team</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage team members shown on the About page. Toggle visibility per member or hide the whole section.
      </p>
      <CrewManager initialData={data} canManage={canManage} />
    </div>
  );
}
