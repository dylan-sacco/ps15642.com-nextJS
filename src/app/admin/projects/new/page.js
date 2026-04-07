import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import ProjectEditor from '@/components/admin/ProjectEditor';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const metadata = { title: 'New Project | Admin' };

export default async function NewProjectPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'projects.create')) {
    return <PermissionDenied permission="projects.create" />;
  }

  const canPublish = hasPermission(user.role, 'projects.publish');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Project</h1>
      <ProjectEditor isNew={true} canPublish={canPublish} />
    </div>
  );
}
