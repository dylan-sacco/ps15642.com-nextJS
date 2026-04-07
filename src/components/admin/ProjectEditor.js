'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MarkdownPreview from './MarkdownPreview';
import MarkdownCheatSheet from './MarkdownCheatSheet';
import PhotoPicker from './PhotoPicker';
import GalleryPickerInput from './GalleryPickerInput';

const VIDEO_EXT = /\.(mp4|mov|webm)$/i;

export default function ProjectEditor({ initialData = {}, isNew = false, canPublish = false }) {
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
  const [gallery, setGallery] = useState(
    Array.isArray(initialData.gallery) ? initialData.gallery : []
  );

  const [showPreview, setShowPreview] = useState(true);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [markdownFocused, setMarkdownFocused] = useState(false);

  // Gallery picker state
  const [showGalleryPicker, setShowGalleryPicker] = useState(false);
  const [allImages, setAllImages] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerSelected, setPickerSelected] = useState(new Set());

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
      const payload = { title, date, excerpt, tags: parsedTags, image, published: canPublish ? published : false, body, gallery };
      let res;

      if (isNew) {
        res = await fetch('/api/admin/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, ...payload }),
        });
      } else {
        const slugChanged = slug !== initialData.slug;
        res = await fetch(`/api/admin/projects/${initialData.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, ...(slugChanged ? { newSlug: slug } : {}) }),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      window.location.href = data.newSlug
        ? `/admin/projects/${data.newSlug}/edit`
        : '/admin/projects';
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
      const res = await fetch(`/api/admin/projects/${initialData.slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      window.location.href = '/admin/projects';
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  // --- Gallery management ---

  function toggleGalleryItem(filename) {
    setGallery(prev =>
      prev.map(item => item.filename === filename ? { ...item, enabled: !item.enabled } : item)
    );
  }

  function removeGalleryItem(filename) {
    setGallery(prev => prev.filter(item => item.filename !== filename));
  }

  async function openGalleryPicker() {
    setPickerSelected(new Set());
    setPickerSearch('');
    setShowGalleryPicker(true);
    if (allImages.length === 0) {
      setPickerLoading(true);
      try {
        const res = await fetch('/api/admin/gallery');
        const data = await res.json();
        setAllImages((data.images || []).filter(img => !VIDEO_EXT.test(img.filename)));
      } catch {
        setAllImages([]);
      } finally {
        setPickerLoading(false);
      }
    }
  }

  function togglePickerSelect(filename) {
    setPickerSelected(prev => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  }

  function addSelectedToGallery() {
    const existing = new Set(gallery.map(item => item.filename));
    const toAdd = [...pickerSelected]
      .filter(f => !existing.has(f))
      .map(f => ({ filename: f, enabled: true }));
    setGallery(prev => [...prev, ...toAdd]);
    setShowGalleryPicker(false);
  }

  const alreadyInGallery = new Set(gallery.map(item => item.filename));
  const pickerFiltered = pickerSearch
    ? allImages.filter(img =>
        img.filename.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        (img.alt || '').toLowerCase().includes(pickerSearch.toLowerCase())
      )
    : allImages;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving || deleting}
          className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded font-medium text-sm disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Project'}
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
          onClick={() => window.location.href = '/admin/projects'}
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
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Slug <span className="text-gray-400">(URL-safe — changing this renames the project)</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
            placeholder="my-project-slug"
            className={`w-full border rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500 ${
              !isNew && slug !== initialData.slug
                ? 'border-amber-400 bg-amber-50'
                : 'border-gray-300'
            }`}
          />
          {!isNew && slug !== initialData.slug && (
            <p className="text-xs text-amber-600 mt-1">
              Will rename to <strong>{slug}</strong> and redirect to the new URL on save.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Project title"
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
            Excerpt <span className="text-gray-400">(shown on projects list)</span>
          </label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Brief summary of the project…"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500 resize-none"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Tags <span className="text-gray-400">(comma-separated — e.g. commercial, landscape, hardscape)</span>
          </label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="commercial, landscape, North Huntingdon"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-lime-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Cover Image <span className="text-gray-400">(optional — used for social sharing and project card)</span>
          </label>
          <GalleryPickerInput
            value={image}
            onChange={setImage}
            placeholder="/api/uploads/my-project.webp or https://…"
          />
          <p className="text-xs text-gray-400 mt-1">
            Pick from gallery (recommended) or paste an external URL. Internal gallery links are more reliable — external URLs can break.
          </p>
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

        {/* Project Gallery */}
        <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-1">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Project Gallery</span>
              <span className="text-xs text-gray-400 ml-2">Photos selected from the main gallery</span>
            </div>
            <button
              type="button"
              onClick={openGalleryPicker}
              className="text-xs bg-lime-600 hover:bg-lime-700 text-white px-3 py-1.5 rounded font-medium transition-colors"
            >
              + Add Photos
            </button>
          </div>

          {gallery.length === 0 ? (
            <p className="text-sm text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-lg">
              No photos selected yet. Click &ldquo;+ Add Photos&rdquo; to pick from the gallery.
            </p>
          ) : (
            <div className="space-y-2">
              {gallery.map(item => (
                <div
                  key={item.filename}
                  className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 bg-gray-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/uploads/${item.filename}`}
                    alt={item.filename}
                    className="w-12 h-12 object-cover rounded flex-shrink-0"
                  />
                  <span className="flex-1 text-xs text-gray-600 font-mono truncate min-w-0">
                    {item.filename}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleGalleryItem(item.filename)}
                    title={item.enabled ? 'Visible — click to hide' : 'Hidden — click to show'}
                    className={`flex-shrink-0 text-xs px-2 py-1 rounded-full font-medium border transition-colors ${
                      item.enabled
                        ? 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                        : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-lime-50 hover:text-lime-700 hover:border-lime-200'
                    }`}
                  >
                    {item.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(item.filename)}
                    title="Remove from project gallery"
                    className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cheat sheet */}
      {showCheatSheet && <MarkdownCheatSheet />}

      {/* Editor row */}
      <div className={`grid gap-4 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <div className="flex flex-col">
          <label className="text-xs font-medium text-gray-500 mb-1">Markdown</label>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={handleTabKey}
            onFocus={() => setMarkdownFocused(true)}
            onBlur={() => setMarkdownFocused(false)}
            className="flex-1 min-h-[500px] border border-gray-300 rounded-lg p-4 font-mono text-sm resize-y outline-none focus:border-lime-500 bg-gray-50"
            placeholder="Write the project description in Markdown…"
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
        <PhotoPicker
          textareaRef={textareaRef}
          onInsert={newBody => setBody(newBody)}
        />
      )}

      {/* Gallery Picker Modal */}
      {showGalleryPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowGalleryPicker(false)}>
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm">Add Photos to Project Gallery</h3>
                <p className="text-xs text-gray-400 mt-0.5">Click photos to select them. Already-added photos are marked.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowGalleryPicker(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* Search */}
            {!pickerLoading && allImages.length > 0 && (
              <div className="px-4 pt-3 pb-2">
                <input
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  placeholder="Search by filename or alt text…"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-lime-400"
                  autoFocus
                />
              </div>
            )}

            {/* Image grid */}
            <div className="overflow-y-auto flex-1 p-3">
              {pickerLoading && (
                <p className="text-sm text-gray-400 text-center py-10">Loading gallery…</p>
              )}
              {!pickerLoading && allImages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-10">No images in the gallery yet.</p>
              )}
              {!pickerLoading && pickerFiltered.length === 0 && allImages.length > 0 && (
                <p className="text-sm text-gray-400 text-center py-10">No results for &ldquo;{pickerSearch}&rdquo;.</p>
              )}
              {!pickerLoading && pickerFiltered.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {pickerFiltered.map(img => {
                    const inGallery = alreadyInGallery.has(img.filename);
                    const isSelected = pickerSelected.has(img.filename);
                    return (
                      <button
                        key={img.filename}
                        type="button"
                        disabled={inGallery}
                        onClick={() => togglePickerSelect(img.filename)}
                        title={inGallery ? `${img.filename} — already in gallery` : img.alt || img.filename}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          inGallery
                            ? 'border-gray-200 opacity-40 cursor-not-allowed'
                            : isSelected
                              ? 'border-lime-500 ring-2 ring-lime-300'
                              : 'border-transparent hover:border-lime-300'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.alt || img.filename}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-lime-500/20 flex items-center justify-center">
                            <div className="bg-lime-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">✓</div>
                          </div>
                        )}
                        {inGallery && (
                          <div className="absolute inset-0 bg-gray-500/20 flex items-end justify-center pb-1">
                            <span className="text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">Added</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                {pickerSelected.size > 0
                  ? `${pickerSelected.size} photo${pickerSelected.size > 1 ? 's' : ''} selected`
                  : 'No photos selected'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowGalleryPicker(false)}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addSelectedToGallery}
                  disabled={pickerSelected.size === 0}
                  className="px-4 py-1.5 text-sm bg-lime-600 hover:bg-lime-700 text-white rounded font-medium disabled:opacity-40 transition-colors"
                >
                  Add {pickerSelected.size > 0 ? `${pickerSelected.size} Photo${pickerSelected.size > 1 ? 's' : ''}` : 'Photos'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
