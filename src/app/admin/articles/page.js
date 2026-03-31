import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { ARTICLES_DIR } from '@/lib/paths';
import { getSessionUser } from '@/lib/adminAuth';
import { hasPermission } from '@/lib/permissions';
import PermissionDenied from '@/components/admin/PermissionDenied';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Articles | Admin' };

function getArticles() {
  try {
    fs.mkdirSync(ARTICLES_DIR, { recursive: true });
    const files = fs.readdirSync(ARTICLES_DIR).filter(f => f.endsWith('.md'));

    return files
      .map(file => {
        const slug = file.replace(/\.md$/, '');
        try {
          const raw = fs.readFileSync(path.join(ARTICLES_DIR, file), 'utf8');
          const { data } = matter(raw);
          return { slug, title: data.title || slug, date: data.date || '', excerpt: data.excerpt || '', published: !!data.published };
        } catch {
          return { slug, title: slug, date: '', excerpt: '', published: false };
        }
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch {
    return [];
  }
}

export default async function AdminArticlesPage() {
  const user = await getSessionUser();
  if (!user || !hasPermission(user.role, 'articles.view')) {
    return <PermissionDenied permission="articles.view" />;
  }

  const canCreate = hasPermission(user.role, 'articles.create');
  const articles = getArticles();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Articles</h1>
        {canCreate && (
          <Link
            href="/admin/articles/new"
            className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
          >
            + New Article
          </Link>
        )}
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">📝</p>
          <p>No articles yet.</p>
          {canCreate && (
            <Link href="/admin/articles/new" className="text-lime-600 hover:underline mt-2 inline-block">
              Create your first article
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(article => (
            <div
              key={article.slug}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      article.published
                        ? 'bg-lime-100 text-lime-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                  {article.date && (
                    <span className="text-xs text-gray-400">{article.date}</span>
                  )}
                </div>
                <h2 className="font-semibold text-gray-800 truncate">{article.title}</h2>
                {article.excerpt && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{article.excerpt}</p>
                )}
                <p className="text-xs text-gray-400 mt-1 font-mono">{article.slug}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/admin/articles/${article.slug}/edit`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Edit
                </Link>
                {article.published && (
                  <Link
                    href={`/articles/${article.slug}`}
                    target="_blank"
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    View ↗
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
