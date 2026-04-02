import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import { getQuotes } from '@/lib/quoteRequests';
import QuoteManager from '@/components/admin/QuoteManager';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Quote Requests | Admin' };

export default async function AdminQuotesPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'quotes.view')) {
    return <PermissionDenied permission="quotes.view" />;
  }
  const quotes = getQuotes();
  const canDelete = hasPermission(user.role, 'quotes.delete');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Quote Requests</h1>
      <QuoteManager initialQuotes={quotes} canDelete={canDelete} />
    </div>
  );
}
