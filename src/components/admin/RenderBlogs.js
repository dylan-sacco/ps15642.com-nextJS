'use client'
import { useState } from 'react';
import { hasPermission } from '@/lib/permissions';
import Link from 'next/link';


export default function RenderBlogs({ blogs: initialBlogs, user }) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [sortByDraft, setSortByDraft] = useState(false);
  const [sortKey, setSortKey] = useState('date');
  const canCreate = hasPermission(user.role, 'blog.create');
  const canFeature = hasPermission(user.role, 'blog.publish');

  function sorted(list) {
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'date':     return (b.date || '').localeCompare(a.date || '');
        case 'edited':   return b.mtime - a.mtime;
        case 'featured': return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'draft':    return (a.published ? 1 : 0) - (b.published ? 1 : 0);
        case 'length':   return b.wordCount - a.wordCount;
        default:         return 0;
      }
    });
  }

  async function toggleFeatured(slug, current) {
    setBlogs(prev => prev.map(b => b.slug === slug ? { ...b, featured: !current } : b));
    try {
      const res = await fetch(`/api/admin/blog/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !current }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setBlogs(prev => prev.map(b => b.slug === slug ? { ...b, featured: current } : b));
    }
  }


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Blog</h1>
        <div className='flex gap-2 flex-wrap items-center'>
          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
            className="text-sm border border-gray-200 rounded px-2 py-2 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-lime-400"
          >
            <option value="date">Date Published</option>
            <option value="edited">Last Edited</option>
            <option value="featured">Featured First</option>
            <option value="draft">Drafts First</option>
            <option value="length">Length Desc</option>
          </select>
          {/* <button
            onClick={() => setSortByDraft(!sortByDraft)}
            className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
          >
            {sortByDraft ? "View All" : "View Drafts"}
          </button> */}

          {canCreate && (
            <Link
              href="/admin/blog/new"
              className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
            >
              + New Post
            </Link>
          )}
        </div>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-4">📝</p>
          <p>No posts yet.</p>
          {canCreate && (
            <Link href="/admin/blog/new" className="text-lime-600 hover:underline mt-2 inline-block">
              Create your first post
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted(blogs).map(blog => {
            if (sortByDraft && blog.published)
              return
            else
              return (
                <div
                  key={blog.slug}
                  className="bg-white border border-gray-200 rounded-lg p-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${blog.published
                          ? 'bg-lime-100 text-lime-700'
                          : 'bg-gray-100 text-gray-500'
                          }`}
                      >
                        {blog.published ? 'Published' : 'Draft'}
                      </span>
                      {blog.featured && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                          Featured
                        </span>
                      )}
                      {blog.date && (
                        <span className="text-xs text-gray-400">{blog.date}</span>
                      )}
                    </div>
                    <h2 className="font-semibold text-gray-800 truncate">{blog.title}</h2>
                    {blog.excerpt && (
                      <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{blog.excerpt}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 font-mono">{blog.slug}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {canFeature && (
                      <button
                        onClick={() => toggleFeatured(blog.slug, blog.featured)}
                        title={blog.featured ? 'Unfeature post' : 'Feature post'}
                        className={`text-xl leading-none transition-colors ${blog.featured ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-300 hover:text-yellow-400'}`}
                      >
                        ★
                      </button>
                    )}
                    <Link
                      href={`/admin/blog/${blog.slug}/edit`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    {blog.published && (
                      <Link
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        View ↗
                      </Link>
                    )}
                  </div>
                </div>
              )
          })}
        </div>
      )
      }
    </div>
  )
}

