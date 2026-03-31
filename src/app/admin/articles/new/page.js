import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import ArticleEditor from '@/components/admin/ArticleEditor';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const metadata = { title: 'New Article | Admin' };

export default async function NewArticlePage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'articles.create')) {
    return <PermissionDenied permission="articles.create" />;
  }

  const canPublish = hasPermission(user.role, 'articles.publish');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Article</h1>
      <ArticleEditor isNew={true} canPublish={canPublish} />
    </div>
  );
}
