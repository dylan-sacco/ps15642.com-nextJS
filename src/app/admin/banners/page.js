import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import { getBanners, getBannerSettings } from '@/lib/banners';
import BannerManager from '@/components/admin/BannerManager';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Banners | Admin' };

export default async function AdminBannersPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'banners.view')) {
    return <PermissionDenied permission="banners.view" />;
  }
  const banners = getBanners();
  const settings = getBannerSettings();
  const canManage = hasPermission(user.role, 'banners.manage');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Banners</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage the contact bar and announcement banners shown across the site.
        Date-ranged banners activate and expire automatically.
      </p>
      <BannerManager initialBanners={banners} initialSettings={settings} canManage={canManage} />
    </div>
  );
}
