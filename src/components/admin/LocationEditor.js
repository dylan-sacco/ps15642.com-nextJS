'use client';

import { useState, useRef } from 'react';
import MarkdownPreview from './MarkdownPreview';
import MarkdownCheatSheet from './MarkdownCheatSheet';
import PhotoPicker from './PhotoPicker';
import GalleryPickerInput from './GalleryPickerInput';

export default function LocationEditor({ initialData = {}, isNew = false, canDelete = false }) {
  const [slug, setSlug] = useState(initialData.slug || '');
  const [heroTitle, setHeroTitle] = useState(initialData.heroTitle || '');
  const [heroImage, setHeroImage] = useState(initialData.heroImage || '');
  const [metaTitle, setMetaTitle] = useState(initialData.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(initialData.metaDescription || '');
  const [body, setBody] = useState(initialData.body || '');

  const [showPreview, setShowPreview] = useState(true);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [markdownFocused, setMarkdownFocused] = useState(false);
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
      const payload = { heroTitle, heroImage, metaTitle, metaDescription, body };
      let res;

      if (isNew) {
        res = await fetch('/api/admin/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, ...payload }),
        });
      } else {
        const slugChanged = slug !== initialData.slug;
        res = await fetch(`/api/admin/locations/${initialData.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, ...(slugChanged ? { newSlug: slug } : {}) }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      window.location.href = data.newSlug
        ? `/admin/locations/${data.newSlug}/edit`
        : '/admin/locations';
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
      const res = await fetch(`/api/admin/locations/${initialData.slug}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      window.location.href = '/admin/locations';
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
          {saving ? 'Saving…' : 'Save Location'}
        </button>

        {!isNew && canDelete && (
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
          onClick={() => window.location.href = '/admin/locations'}
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

      {/* Fields */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Slug <span className="text-gray-400">(URL — e.g. "north-huntingdon" → /locations/north-huntingdon)</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="north-huntingdon"
            className={`w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500 ${
              !isNew && slug !== initialData.slug
                ? 'border-amber-400 bg-amber-50'
                : 'border-gray-300'
            }`}
          />
          {!isNew && slug !== initialData.slug && (
            <p className="text-xs text-amber-600 mt-1">
              Will rename to <strong>{slug}</strong> on save.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Hero Title</label>
          <input
            type="text"
            value={heroTitle}
            onChange={e => setHeroTitle(e.target.value)}
            placeholder="Landscaping & Contracting in North Huntingdon, PA"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Hero Image <span className="text-gray-400">(shown in the parallax banner at the top of the page)</span>
          </label>
          <GalleryPickerInput
            value={heroImage}
            onChange={setHeroImage}
            placeholder="/api/uploads/north-huntingdon-hero"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Meta Title <span className="text-gray-400">(optional — defaults to hero title)</span>
          </label>
          <input
            type="text"
            value={metaTitle}
            onChange={e => setMetaTitle(e.target.value)}
            placeholder="North Huntingdon Landscaping | P&S Contracting"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Meta Description <span className="text-gray-400">(optional — for search engines)</span>
          </label>
          <input
            type="text"
            value={metaDescription}
            onChange={e => setMetaDescription(e.target.value)}
            placeholder="Expert landscaping services in North Huntingdon, PA…"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500"
          />
        </div>
      </div>

      {showCheatSheet && <MarkdownCheatSheet />}

      {/* Editor */}
      <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">Page Content (Markdown)</label>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={handleTabKey}
            onFocus={() => setMarkdownFocused(true)}
            onBlur={() => setMarkdownFocused(false)}
            className="flex-1 min-h-[500px] border border-gray-300 rounded-lg p-4 font-mono text-sm resize-y outline-none focus:border-lime-500 bg-gray-50"
            placeholder="Write the location page content in Markdown…"
            spellCheck={false}
          />
        </div>

        {showPreview && (
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-500 mb-1">Preview</label>
            <div className="flex-1 min-h-[500px] border border-gray-200 rounded-lg p-4 bg-white overflow-y-auto">
              <MarkdownPreview body={body} />
            </div>
          </div>
        )}
      </div>

      {markdownFocused && (
        <PhotoPicker textareaRef={textareaRef} onInsert={newBody => setBody(newBody)} />
      )}
    </div>
  );
}
