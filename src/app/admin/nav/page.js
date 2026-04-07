import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import PermissionDenied from '@/components/admin/PermissionDenied';
import NavEditor from '@/components/admin/NavEditor';
import { getNavItems } from '@/lib/nav';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Navigation | Admin' };

export default async function AdminNavPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'nav.manage')) {
    return <PermissionDenied permission="nav.manage" />;
  }

  const items = getNavItems();
  return <NavEditor initialItems={items} />;
}
