import fs from 'fs';
import path from 'path';
import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import WhitelistManager from '@/components/admin/WhitelistManager';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const metadata = { title: 'IP Whitelist | Admin' };

function getWhitelist() {
  try {
    const file = path.join(process.cwd(), 'data', 'ip-whitelist.json');
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
}

export default async function AdminWhitelistPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'whitelist.view')) {
    return <PermissionDenied permission="whitelist.view" />;
  }

  const entries = getWhitelist();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">IP Whitelist</h1>
      <p className="text-sm text-gray-500 mb-6">
        Grant temporary admin access to an external IP. Whitelisted IPs still need to log in with a password.
      </p>
      <WhitelistManager initialEntries={entries} />
    </div>
  );
}
