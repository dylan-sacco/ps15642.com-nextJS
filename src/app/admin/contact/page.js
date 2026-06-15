import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import { getSubmissions } from '@/lib/contactSubmissions';
import ContactManager from '@/components/admin/ContactManager';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Contact Submissions | Admin' };

export default async function AdminContactPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'contact.view')) {
    return <PermissionDenied permission="contact.view" />;
  }

  const submissions = getSubmissions();
  const canDelete = hasPermission(user.role, 'contact.delete');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Contact Submissions</h1>
      <ContactManager initialSubmissions={submissions} canDelete={canDelete} />
    </div>
  );
}
