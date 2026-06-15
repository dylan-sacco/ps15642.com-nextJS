'use client';

import { useState } from 'react';

const VIDEO_EXT = /\.(mp4|mov|webm)$/i;

/**
 * A text input + gallery picker button.
 * Props:
 *   value      — current URL string
 *   onChange   — (url: string) => void
 *   placeholder
 *   required
 */
export default function GalleryPickerInput({ value, onChange, placeholder, required }) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  async function openPicker() {
    setOpen(true);
    if (images.length === 0) {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/gallery');
        const data = await res.json();
        setImages((data.images || []).filter(img => !VIDEO_EXT.test(img.filename)));
      } catch {
        setImages([]);
      } finally {
        setLoading(false);
      }
    }
  }

  function select(img) {
    onChange(img.url);
    setOpen(false);
    setSearch('');
  }

  const filtered = search
    ? images.filter(img =>
        img.filename.toLowerCase().includes(search.toLowerCase()) ||
        (img.alt || '').toLowerCase().includes(search.toLowerCase())
      )
    : images;

  return (
    <div className="relative">
      <div className="flex gap-1">
        <input
          required={required}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm min-w-0"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={openPicker}
          className="flex-shrink-0 px-2 py-1.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-lime-400 hover:text-lime-700 transition-colors"
          title="Pick from gallery"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            <circle cx="8.5" cy="10.5" r="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 19" />
          </svg>
        </button>
      </div>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setSearch(''); }} />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl w-72 max-h-80 flex flex-col z-50 overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pick from Gallery</span>
              <button
                type="button"
                onClick={() => { setOpen(false); setSearch(''); }}
                className="text-gray-400 hover:text-gray-600 text-sm leading-none"
              >✕</button>
            </div>

            {!loading && images.length > 0 && (
              <div className="px-2 pt-2 pb-1">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:border-lime-400"
                />
              </div>
            )}

            <div className="overflow-y-auto flex-1 p-2">
              {loading && <p className="text-sm text-gray-400 text-center py-6">Loading…</p>}
              {!loading && images.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No images in gallery.</p>
              )}
              {!loading && images.length > 0 && filtered.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No results for &ldquo;{search}&rdquo;.</p>
              )}
              {!loading && filtered.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5">
                  {filtered.map(img => (
                    <button
                      key={img.filename}
                      type="button"
                      onClick={() => select(img)}
                      className="aspect-square rounded overflow-hidden border-2 border-transparent hover:border-lime-500 transition-colors"
                      title={img.alt || img.filename}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.alt || img.filename}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
