import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { ARTICLES_DIR } from '@/lib/paths';
import ArticleEditor from '@/components/admin/ArticleEditor';

export const metadata = { title: 'Edit Article | Admin' };

export default async function EditArticlePage({ params }) {
  const { slug } = await params;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();

  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  const tags = Array.isArray(data.tags)
    ? data.tags
    : data.tags ? String(data.tags).split(',').map(t => t.trim()).filter(Boolean) : [];

  const initialData = {
    slug,
    title: data.title || '',
    date: data.date || '',
    excerpt: data.excerpt || '',
    tags,
    image: data.image || '',
    published: !!data.published,
    body: content,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Article</h1>
      <ArticleEditor initialData={initialData} isNew={false} />
    </div>
  );
}
