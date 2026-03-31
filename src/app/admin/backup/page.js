import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import { listBackups, getTotalBackupsSize, getSizeLimitBytes } from '@/lib/backup';
import PermissionDenied from '@/components/admin/PermissionDenied';
import BackupManager from '@/components/admin/BackupManager';

export const metadata = { title: 'Backup & Restore | Admin' };

export default async function AdminBackupPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'backup.view')) {
    return <PermissionDenied permission="backup.view" />;
  }

  const canManage  = hasPermission(user.role, 'backup.manage');
  const backups    = listBackups();
  const usedBytes  = getTotalBackupsSize();
  const limitBytes = getSizeLimitBytes();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Backup &amp; Restore</h1>
      <p className="text-sm text-gray-500 mb-6">
        Backups include both the gallery and articles. You can restore each independently.
      </p>
      <BackupManager
        initialBackups={backups}
        initialUsedBytes={usedBytes}
        limitBytes={limitBytes}
        canManage={canManage}
      />
    </div>
  );
}
