import { cookies } from 'next/headers';
import AdminNav from '@/components/admin/AdminNav';
import { getPermissions } from '@/lib/permissions';

export const metadata = {
  title: 'Admin | P&S Contracting',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  let username = null;
  let permissions = [];

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_auth')?.value;
    if (token) {
      const [payload] = token.split('.');
      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
      username = decoded.username ?? null;
      permissions = getPermissions(decoded.role);
    }
  } catch { /* not logged in yet */ }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav username={username} permissions={permissions} />
      <main className="p-6">{children}</main>
    </div>
  );
}
