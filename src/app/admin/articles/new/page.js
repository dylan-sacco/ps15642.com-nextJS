import ArticleEditor from '@/components/admin/ArticleEditor';

export const metadata = { title: 'New Article | Admin' };

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Article</h1>
      <ArticleEditor isNew={true} />
    </div>
  );
}
