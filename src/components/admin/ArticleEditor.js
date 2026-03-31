'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownPreview from './MarkdownPreview';
import MarkdownCheatSheet from './MarkdownCheatSheet';

export default function ArticleEditor({ initialData = {}, isNew = false, canPublish = false }) {
  const router = useRouter();

  const [slug, setSlug] = useState(initialData.slug || '');
  const [title, setTitle] = useState(initialData.title || '');
  const [date, setDate] = useState(
    initialData.date || new Date().toISOString().slice(0, 10)
  );
  const [excerpt, setExcerpt] = useState(initialData.excerpt || '');
  const [tags, setTags] = useState(
    Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || '')
  );
  const [image, setImage] = useState(initialData.image || '');
  const [published, setPublished] = useState(!!initialData.published);
  const [body, setBody] = useState(initialData.body || '');

  const [showPreview, setShowPreview] = useState(true);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const textareaRef = useRef(null);

  function handleTabKey(e) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newBody = body.slice(0, start) + '  ' + body.slice(end);
    setBody(newBody);
    requestAnimationFrame(() => {
      ta.selectionStart = start + 2;
      ta.selectionEnd = start + 2;
    });
  }

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = { title, date, excerpt, tags: parsedTags, image, published: canPublish ? published : false, body };
      let res;

      if (isNew) {
        res = await fetch('/api/admin/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, ...payload }),
        });
      } else {
        res = await fetch(`/api/admin/articles/${initialData.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      window.location.href = '/admin/articles';
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${initialData.slug}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/${initialData.slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      window.location.href = '/admin/articles';
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving || deleting}
          className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded font-medium text-sm disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Article'}
        </button>

        {!isNew && (
          <button
            onClick={handleDelete}
            disabled={saving || deleting}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium text-sm disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}

        <button
          onClick={() => setShowPreview(p => !p)}
          className={`px-3 py-2 rounded text-sm font-medium border transition-colors ${
            showPreview
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>

        <button
          onClick={() => setShowCheatSheet(c => !c)}
          className={`px-3 py-2 rounded text-sm font-medium border transition-colors ${
            showCheatSheet
              ? 'bg-amber-100 border-amber-300 text-amber-700'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {showCheatSheet ? 'Hide Tips' : 'Markdown Tips'}
        </button>

        <button
          onClick={() => window.location.href = '/admin/articles'}
          className="px-3 py-2 rounded text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Front matter fields */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isNew && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Slug <span className="text-gray-400">(URL-safe, e.g. my-article)</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="my-article-slug"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Article title"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Excerpt <span className="text-gray-400">(shown on articles list)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Brief summary of the article…"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500 resize-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tags <span className="text-gray-400">(comma-separated — e.g. lawn care, spring tips)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="lawn care, spring tips, North Huntingdon"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Tags create browseable topic pages and help group related articles. Keep them descriptive, not spammy.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            OG Image URL <span className="text-gray-400">(optional — used for social sharing previews)</span>
          </label>
          <input
            type="text"
            value={image}
            onChange={e => setImage(e.target.value)}
            placeholder="/api/images/my-project.jpg"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        {canPublish && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="w-4 h-4 accent-lime-600"
            />
            <label htmlFor="published" className="text-sm text-gray-700">
              Published <span className="text-gray-400 text-xs">(visible on public site)</span>
            </label>
          </div>
        )}
      </div>

      {/* Cheat sheet */}
      {showCheatSheet && <MarkdownCheatSheet />}

      {/* Editor row */}
      <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Textarea */}
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">Markdown</label>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={handleTabKey}
            className="flex-1 min-h-[500px] border border-gray-300 rounded-lg p-4 font-mono text-sm resize-y outline-none focus:border-lime-500 bg-gray-50"
            placeholder="Write your article in Markdown…"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-1">Preview</label>
            <div className="flex-1 min-h-[500px] border border-gray-200 rounded-lg p-4 bg-white overflow-y-auto">
              <MarkdownPreview body={body} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
