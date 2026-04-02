import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import { getPairs } from '@/lib/beforeAfter';
import BeforeAfterManager from '@/components/admin/BeforeAfterManager';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Before & After | Admin' };

export default async function AdminBeforeAfterPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'beforeafter.view')) {
    return <PermissionDenied permission="beforeafter.view" />;
  }
  const pairs = getPairs();
  const canManage = hasPermission(user.role, 'beforeafter.manage');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Before &amp; After Gallery</h1>
      <BeforeAfterManager initialPairs={pairs} canManage={canManage} />
    </div>
  );
}
