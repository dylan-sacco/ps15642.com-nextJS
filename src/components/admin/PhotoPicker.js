'use client';

import { useState } from 'react';

const VIDEO_EXT = /\.(mp4|mov|webm)$/i;

export default function PhotoPicker({ textareaRef, onInsert }) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Prevent any interaction with the picker from blurring the textarea
  function preventBlur(e) {
    e.preventDefault();
  }

  async function togglePicker(e) {
    e.preventDefault();
    const next = !open;
    setOpen(next);
    if (next && images.length === 0) {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/gallery');
        const data = await res.json();
        setImages(data.images || []);
      } catch {
        setImages([]);
      } finally {
        setLoading(false);
      }
    }
  }

  function insertFile(e, filename) {
    e.preventDefault();
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    const src = `/api/uploads/${filename.replace(/\.[^.]+$/, '')}`;

    const img = images.find(i => i.filename === filename);
    const poster = img?.thumbUrl ? ` poster="${img.thumbUrl}"` : '';
    const insertion = VIDEO_EXT.test(filename)
      ? `<video controls src="${src}"${poster} style="max-width:100%;border-radius:8px"></video>`
      : `![AltText](${src})`;

    const newValue = ta.value.slice(0, start) + insertion + ta.value.slice(end);

    onInsert(newValue);

    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = start + insertion.length;
      ta.selectionEnd = start + insertion.length;
    });

    setOpen(false);
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2" onMouseDown={preventBlur}>
      {/* Panel */}
      {open && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-80 max-h-96 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between">
            <span>Select a Photo or Video</span>
            <button
              onMouseDown={e => { e.preventDefault(); setOpen(false); }}
              className="text-gray-400 hover:text-gray-600 text-base leading-none"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-2">
            {loading && (
              <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
            )}
            {!loading && images.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No uploads in gallery.</p>
            )}
            {!loading && images.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {images.map(img => {
                  const isVideo = VIDEO_EXT.test(img.filename);
                  return (
                    <button
                      key={img.filename}
                      onMouseDown={e => insertFile(e, img.filename)}
                      className="aspect-square rounded overflow-hidden border border-transparent hover:border-lime-500 focus:outline-none focus:border-lime-500 transition-colors group relative"
                      title={img.filename}
                    >
                      {isVideo ? (
                        <>
                          {img.thumbUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={img.thumbUrl}
                              alt={img.filename}
                              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                            />
                          ) : (
                            /* eslint-disable-next-line jsx-a11y/media-has-caption */
                            <video
                              src={img.url}
                              muted
                              preload="metadata"
                              className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/40 rounded-full p-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white fill-white" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={img.url}
                          alt={img.filename}
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onMouseDown={togglePicker}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          open
            ? 'bg-lime-600 text-white'
            : 'bg-white border border-gray-300 text-gray-600 hover:bg-lime-50 hover:border-lime-400 hover:text-lime-700'
        }`}
        title="Insert photo or video"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          <circle cx="8.5" cy="10.5" r="1.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 19" />
        </svg>
      </button>
    </div>
  );
}
