import { readUsers } from '@/lib/auth';
import { assignableRoles, hasPermission } from '@/lib/permissions';
import { ROLES, DEFAULT_ROLE } from '@/config/roles';
import { getSessionUser } from '@/lib/adminAuth';
import UserManager from '@/components/admin/UserManager';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const metadata = { title: 'User Management | Admin' };

export default async function AdminUsersPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || !hasPermission(sessionUser.role, 'users.view')) {
    return <PermissionDenied permission="users.view" />;
  }

  const users = readUsers().map(u => ({
    username: u.username,
    role: u.role ?? DEFAULT_ROLE,
  }));

  const currentUsername = sessionUser.username;
  const currentRole = sessionUser.role ?? DEFAULT_ROLE;

  const rolesForSelect = assignableRoles(currentRole).map(name => ({
    name,
    label: ROLES[name].label,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>
      <UserManager
        initialUsers={users}
        currentUsername={currentUsername}
        currentRole={currentRole}
        rolesForSelect={rolesForSelect}
      />
    </div>
  );
}
