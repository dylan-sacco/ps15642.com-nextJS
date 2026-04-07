'use client';

import { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableImage({ image, onRename, onDelete, onToggleDisabled, onConvert, onConvertVideo, onRotate, onAltUpdate, onGenerateThumb, selected, onSelect, selecting }) {
  const { filename, url, disabled, thumbUrl, alt } = image;
  const isWebP = filename.toLowerCase().endsWith('.webp');
  const isVideo = /\.(mp4|mov|webm)$/i.test(filename);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const [busy, setBusy] = useState(null); // 'convert' | 'rotate' | null
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const menuRef = useRef(null);
  const [editingAlt, setEditingAlt] = useState(false);
  const [altValue, setAltValue] = useState(alt || '');
  const altInputRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: filename });

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);
  const dotIdx = filename.lastIndexOf('.');
  const baseName = dotIdx > 0 ? filename.slice(0, dotIdx) : filename;
  const ext = dotIdx > 0 ? filename.slice(dotIdx) : '';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  function startEdit() {
    setEditValue(baseName);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function commitRename() {
    setEditing(false);
    const newBase = editValue.trim();
    if (!newBase || !/^[a-zA-Z0-9_-]+$/.test(newBase)) return;
    const newName = newBase + ext;
    if (newName === filename) return;
    await onRename(filename, newName);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setEditing(false);
  }

  async function doConvert() {
    setMenuOpen(false);
    setBusy('convert');
    await onConvert(filename);
    setBusy(null);
  }

  async function doConvertVideo(targetFormat) {
    setMenuOpen(false);
    setFormatOpen(false);
    setBusy('convert');
    await onConvertVideo(filename, targetFormat);
    setBusy(null);
  }

  async function doRotate() {
    setMenuOpen(false);
    setBusy('rotate');
    await onRotate(filename);
    setBusy(null);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={selecting ? () => onSelect(filename) : undefined}
      className={`relative rounded-lg shadow border overflow-hidden group transition-all ${
        selecting ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-blue-500 ring-2 ring-blue-400'
          : disabled
          ? 'border-orange-300 bg-orange-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      {/* Drag handle — hidden in selection mode */}
      <div
        {...(!selecting ? attributes : {})}
        {...(!selecting ? listeners : {})}
        className={`absolute top-2 left-2 z-10 bg-black/40 rounded p-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 ${
          selecting ? 'hidden' : 'cursor-grab active:cursor-grabbing'
        }`}
        title="Drag to reorder"
      >
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="9" cy="5" r="1.5" />
          <circle cx="15" cy="5" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="19" r="1.5" />
        </svg>
      </div>

      {/* Select checkbox — bottom-left of thumbnail */}
      <button
        onClick={(e) => { e.stopPropagation(); onSelect(filename); }}
        className={`absolute bottom-17 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          selected
            ? 'bg-blue-500 border-blue-500'
            : 'bg-white/80 border-gray-400 sm:opacity-0 sm:group-hover:opacity-100'
        }`}
        title={selected ? 'Deselect' : 'Select'}
      >
        {selected && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* 3-dot menu */}
      <div ref={menuRef} className="absolute top-2 right-2 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
          className="bg-black/40 hover:bg-black/60 text-white rounded p-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center"
          title="Options"
        >
          {busy ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-7 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[160px]">
            <button
              onClick={() => { setMenuOpen(false); setPreviewing(true); }}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
            <button
              onClick={() => { setMenuOpen(false); onGenerateThumb(filename); }}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {thumbUrl ? 'Regenerate Thumbnail' : 'Generate Thumbnail'}
            </button>
            <div className="border-t border-gray-100 mb-1" />
            {!isVideo && !isWebP && (
              <button
                onClick={doConvert}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Convert to WebP
              </button>
            )}
            {isVideo && (
              <>
                <button
                  onClick={() => setFormatOpen(f => !f)}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                  Video Format
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 ml-auto transition-transform ${formatOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {formatOpen && (
                  <div className="bg-gray-50 border-t border-b border-gray-100 py-0.5">
                    {ext.toLowerCase() !== '.mp4' && (
                      <button
                        onClick={() => doConvertVideo('mp4')}
                        className="w-full text-left pl-8 pr-3 py-1.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        MP4 (H.264) — universal
                      </button>
                    )}
                    {ext.toLowerCase() !== '.webm' && (
                      <button
                        onClick={() => doConvertVideo('webm')}
                        className="w-full text-left pl-8 pr-3 py-1.5 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                      >
                        WebM (VP9) — smaller
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
            {!isVideo && (
              <button
                onClick={doRotate}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Rotate Clockwise
              </button>
            )}
            <a
              href={`/api/uploads/${filename}?download=1`}
              download={filename}
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => { setMenuOpen(false); onDelete(filename); }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div className="relative">
        {isVideo ? (
          thumbUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={thumbUrl}
              alt={filename}
              className={`w-full aspect-square object-cover transition-all ${
                disabled ? 'opacity-40 grayscale' : ''
              }`}
              loading="lazy"
            />
          ) : (
            <>
              {!videoLoaded && (
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10 pointer-events-none">
                  <div className="w-6 h-6 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                </div>
              )}
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                src={url}
                muted
                preload="metadata"
                className={`w-full aspect-square object-cover transition-all ${
                  disabled ? 'opacity-40 grayscale' : ''
                }`}
                onLoadedData={() => setVideoLoaded(true)}
              />
            </>
          )
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={thumbUrl || url}
            alt={filename}
            className={`w-full aspect-square object-cover transition-all ${
              disabled ? 'opacity-40 grayscale' : ''
            }`}
            loading="lazy"
          />
        )}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 rounded-full p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        )}
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-orange-500/90 text-white text-xs font-semibold px-2 py-0.5 rounded">
              Hidden
            </span>
          </div>
        )}
        {!thumbUrl && !busy && (
          <div className="absolute bottom-1 right-1 pointer-events-none">
            <span className="bg-yellow-500/90 text-white text-xs font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              No Thumb
            </span>
          </div>
        )}
      </div>

      {/* Alt text row */}
      <div className="px-2 pb-1 bg-white" onClick={e => e.stopPropagation()}>
        {editingAlt ? (
          <input
            ref={altInputRef}
            value={altValue}
            onChange={e => setAltValue(e.target.value)}
            onBlur={async () => { setEditingAlt(false); await onAltUpdate(filename, altValue); }}
            onKeyDown={e => {
              if (e.key === 'Enter') altInputRef.current?.blur();
              if (e.key === 'Escape') { setEditingAlt(false); setAltValue(alt || ''); }
            }}
            className="w-full text-xs border border-lime-400 rounded px-1 py-0.5 outline-none"
            placeholder="Alt text…"
          />
        ) : (
          <button
            onClick={() => { setEditingAlt(true); setTimeout(() => altInputRef.current?.focus(), 0); }}
            className="w-full text-left text-xs text-gray-400 hover:text-lime-700 truncate italic"
            title="Click to set alt text"
          >
            {altValue || 'Add alt text…'}
          </button>
        )}
      </div>

      {/* Footer: filename + visibility toggle */}
      <div className="px-2 pb-2 bg-white flex items-center gap-1">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center border border-lime-500 rounded overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                onBlur={commitRename}
                onKeyDown={handleKeyDown}
                className="min-w-0 flex-1 text-xs px-1 py-0.5 outline-none"
              />
              {ext && (
                <span className="text-xs text-gray-400 bg-gray-100 px-1 py-0.5 border-l border-lime-500 shrink-0 select-none">
                  {ext}
                </span>
              )}
            </div>
          ) : (
            <button
              onClick={selecting ? undefined : startEdit}
              className="w-full text-left text-xs text-gray-600 hover:text-lime-700 truncate"
              title={selecting ? undefined : 'Click to rename'}
            >
              {filename}
            </button>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onToggleDisabled(filename, !disabled); }}
          title={disabled ? 'Show in gallery' : 'Hide from gallery'}
          className={`shrink-0 p-1 rounded transition-colors ${
            disabled
              ? 'text-orange-500 hover:text-orange-700 hover:bg-orange-100'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
        >
          {disabled ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>

      {/* Preview modal */}
      {previewing && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewing(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewing(false)}
              className="absolute -top-3 -right-3 z-10 bg-white rounded-full w-7 h-7 flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-lg text-sm font-bold"
            >✕</button>
            {isVideo ? (
              /* eslint-disable-next-line jsx-a11y/media-has-caption */
              <video
                src={url}
                poster={thumbUrl ?? undefined}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={url}
                alt={alt || filename}
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain"
              />
            )}
            <p className="absolute bottom-2 left-0 right-0 text-center text-white/70 text-xs pointer-events-none">{filename}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GalleryManager({ initialImages }) {
  const [images, setImages] = useState(initialImages);
  const [selected, setSelected] = useState(new Set());
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, fileIndex: 0, fileCount: 0, fileName: '' });
  const [importAsWebp, setImportAsWebp] = useState(true);
  const [convertingAll, setConvertingAll] = useState(false);
  const [generatingThumbs, setGeneratingThumbs] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'images' | 'videos'
  const [noThumbOnly, setNoThumbOnly] = useState(false);
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  function showStatus(msg, isError = false) {
    setStatus({ msg, isError });
    setTimeout(() => setStatus(''), 3000);
  }

  function toggleSelect(filename) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(filename) ? next.delete(filename) : next.add(filename);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function selectAll() {
    setSelected(new Set(images.map(img => img.filename)));
  }

  async function saveOrder(reordered) {
    setImages(reordered);
    try {
      const res = await fetch('/api/admin/gallery/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: reordered.map(img => img.filename) }),
      });
      if (!res.ok) throw new Error('Reorder failed');
      showStatus('Order saved');
    } catch (err) {
      showStatus(err.message, true);
    }
  }

  function handleMoveToTop() {
    const sel = images.filter(img => selected.has(img.filename));
    const rest = images.filter(img => !selected.has(img.filename));
    saveOrder([...sel, ...rest]);
  }

  function handleMoveToBottom() {
    const sel = images.filter(img => selected.has(img.filename));
    const rest = images.filter(img => !selected.has(img.filename));
    saveOrder([...rest, ...sel]);
  }

  async function handleDeleteSelected() {
    const filenames = [...selected];
    if (!window.confirm(`Delete ${filenames.length} image(s)? This cannot be undone.`)) return;
    setBulkDeleting(true);
    try {
      const res = await fetch('/api/admin/gallery/bulk-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filenames }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Bulk delete failed');
      }
      setImages(prev => prev.filter(img => !selected.has(img.filename)));
      setSelected(new Set());
      showStatus(`Deleted ${filenames.length} image(s)`);
    } catch (err) {
      showStatus(err.message, true);
    } finally {
      setBulkDeleting(false);
    }
  }

  function uploadFileXhr(file, fileIndex, fileCount) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('files', file);
      if (importAsWebp) formData.append('convertToWebp', '1');

      setUploadProgress({ current: 0, fileIndex, fileCount, fileName: file.name });

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress({ current: Math.round((e.loaded / e.total) * 100), fileIndex, fileCount, fileName: file.name });
        }
      };

      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(data);
          } else {
            reject(new Error(data.error || 'Upload failed'));
          }
        } catch {
          reject(new Error('Invalid server response'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));
      xhr.ontimeout = () => reject(new Error('Upload timed out'));

      xhr.open('POST', '/api/admin/gallery/upload');
      xhr.send(formData);
    });
  }

  async function uploadFiles(files) {
    if (!files.length) return;
    setUploading(true);
    let successCount = 0;
    let failCount = 0;
    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const data = await uploadFileXhr(file, i + 1, files.length);
        const newImages = data.uploaded.map(name => ({
          filename: name,
          url: `/api/uploads/${name.replace(/\.[^.]+$/, '')}`,
          thumbUrl: data.thumbUrls?.[name] ?? null,
          disabled: false,
        }));
        uploadedImages.push(...newImages);
        successCount++;
      } catch (err) {
        console.error(`Failed to upload ${file.name}:`, err);
        failCount++;
      }
    }

    setImages(prev => [...uploadedImages, ...prev]);
    setUploading(false);
    setUploadProgress({ current: 0, fileIndex: 0, fileCount: 0, fileName: '' });

    if (failCount === 0) showStatus(`Successfully uploaded ${successCount} file(s)`);
    else if (successCount === 0) showStatus(`Failed to upload ${failCount} file(s)`, true);
    else showStatus(`Uploaded ${successCount}, failed ${failCount}`, true);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    uploadFiles(files);
  }

  function handleFileInput(e) {
    uploadFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  function handleDragStart({ active }) {
    setActiveId(active.id);
  }

  async function handleDragEnd(event) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (isFiltered) return; // reorder disabled while filtering

    const oldIndex = images.findIndex(img => img.filename === active.id);
    const newIndex = images.findIndex(img => img.filename === over.id);
    saveOrder(arrayMove(images, oldIndex, newIndex));
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  async function handleRename(oldName, newName) {
    try {
      const res = await fetch('/api/admin/gallery/rename', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rename failed');

      setImages(prev =>
        prev.map(img => {
          if (img.filename !== oldName) return img;
          const newBase = data.newName.replace(/\.[^.]+$/, '');
          const newIsVideo = /\.(mp4|mov|webm)$/i.test(data.newName);
          return {
            ...img,
            filename: data.newName,
            url: `/api/uploads/${newBase}`,
            thumbUrl: img.thumbUrl ? `/api/uploads/${newBase}.thumb.webp` : null,
          };
        })
      );
      setSelected(prev => {
        if (!prev.has(oldName)) return prev;
        const next = new Set(prev);
        next.delete(oldName);
        next.add(data.newName);
        return next;
      });
      showStatus(`Renamed to ${data.newName}`);
    } catch (err) {
      showStatus(err.message, true);
    }
  }

  async function handleDelete(filename) {
    if (!window.confirm(`Delete "${filename}"? This cannot be undone.`)) return;

    try {
      const res = await fetch('/api/admin/gallery/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      setImages(prev => prev.filter(img => img.filename !== filename));
      setSelected(prev => { const next = new Set(prev); next.delete(filename); return next; });
      showStatus(`Deleted ${filename}`);
    } catch (err) {
      showStatus(err.message, true);
    }
  }

  async function handleConvert(filename) {
    try {
      const res = await fetch('/api/admin/gallery/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Conversion failed');

      setImages(prev =>
        prev.map(img =>
          img.filename === filename
            ? { ...img, filename: data.newFilename, url: `/api/uploads/${data.newFilename.replace(/\.[^.]+$/, '')}` }
            : img
        )
      );
      setSelected(prev => {
        if (!prev.has(filename)) return prev;
        const next = new Set(prev);
        next.delete(filename);
        next.add(data.newFilename);
        return next;
      });
      showStatus(`Converted to ${data.newFilename}`);
    } catch (err) {
      showStatus(err.message, true);
    }
  }

  async function handleConvertVideo(filename, targetFormat) {
    try {
      const res = await fetch('/api/admin/gallery/convert-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, targetFormat }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Conversion failed');

      setImages(prev =>
        prev.map(img =>
          img.filename === filename
            ? {
                ...img,
                filename: data.newFilename,
                url: `/api/uploads/${data.newFilename.replace(/\.[^.]+$/, '')}?v=${data.mtime}`,
                thumbUrl: data.thumbUrl ?? img.thumbUrl,
              }
            : img
        )
      );
      setSelected(prev => {
        if (!prev.has(filename)) return prev;
        const next = new Set(prev);
        next.delete(filename);
        next.add(data.newFilename);
        return next;
      });
      showStatus(`Converted to ${data.newFilename}`);
    } catch (err) {
      showStatus(err.message, true);
    }
  }

  async function handleRotate(filename) {
    try {
      const res = await fetch('/api/admin/gallery/rotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rotation failed');
      // Force React to re-request the image and thumbnail with fresh cache-busted URLs
      setImages(prev =>
        prev.map(img =>
          img.filename === filename
            ? {
                ...img,
                url: `/api/uploads/${filename.replace(/\.[^.]+$/, '')}?v=${data.mtime}`,
                thumbUrl: data.thumbUrl ?? img.thumbUrl,
              }
            : img
        )
      );
      showStatus(`Rotated ${filename}`);
    } catch (err) {
      showStatus(err.message, true);
    }
  }

  async function handleConvertAll() {
    const nonWebp = images.filter(img => !img.filename.toLowerCase().endsWith('.webp') && !/\.(mp4|mov|webm)$/i.test(img.filename));
    if (!nonWebp.length) return;
    setConvertingAll(true);
    let done = 0;
    for (const img of nonWebp) {
      showStatus(`Converting ${++done} of ${nonWebp.length}…`);
      await handleConvert(img.filename);
    }
    setConvertingAll(false);
    showStatus(`Converted ${nonWebp.length} image(s) to WebP`);
  }

  async function handleGenerateThumbnails() {
    setGeneratingThumbs(true);
    try {
      const res = await fetch('/api/admin/gallery/generate-thumbnails', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate thumbnails');

      // Refresh gallery list to pick up newly generated thumbUrls
      const listRes = await fetch('/api/admin/gallery');
      const listData = await listRes.json();
      if (listRes.ok) setImages(listData.images);

      showStatus(`Generated ${data.generated} thumbnail(s), ${data.skipped} already existed`);
    } catch (err) {
      showStatus(err.message, true);
    } finally {
      setGeneratingThumbs(false);
    }
  }

  async function handleGenerateSingleThumbnail(filename) {
    try {
      const res = await fetch('/api/admin/gallery/generate-thumbnails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate thumbnail');
      setImages(prev => prev.map(img =>
        img.filename === filename ? { ...img, thumbUrl: data.thumbUrl } : img
      ));
      showStatus(`Thumbnail generated for ${filename}`);
    } catch (err) {
      showStatus(err.message, true);
    }
  }

  async function handleToggleDisabled(filename, disabled) {
    try {
      const res = await fetch('/api/admin/gallery/disable', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, disabled }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update visibility');
      }
      setImages(prev =>
        prev.map(img => img.filename === filename ? { ...img, disabled } : img)
      );
      showStatus(disabled ? `"${filename}" hidden from gallery` : `"${filename}" visible in gallery`);
    } catch (err) {
      showStatus(err.message, true);
    }
  }

  async function handleAltUpdate(filename, altText) {
    try {
      await fetch('/api/admin/gallery/alt', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, alt: altText }),
      });
      setImages(prev => prev.map(img => img.filename === filename ? { ...img, alt: altText } : img));
    } catch (err) {
      showStatus(err.message, true);
    }
  }

  // Compute filtered/sorted display list
  const displayImages = (() => {
    let result = [...images];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(img =>
        img.filename.toLowerCase().includes(q) ||
        (img.alt || '').toLowerCase().includes(q)
      );
    }
    if (typeFilter === 'images') result = result.filter(img => !/\.(mp4|mov|webm)$/i.test(img.filename));
    else if (typeFilter === 'videos') result = result.filter(img => /\.(mp4|mov|webm)$/i.test(img.filename));
    if (noThumbOnly) result = result.filter(img => !img.thumbUrl);
    if (sortBy === 'name-asc') result.sort((a, b) => a.filename.localeCompare(b.filename));
    else if (sortBy === 'name-desc') result.sort((a, b) => b.filename.localeCompare(a.filename));
    else if (sortBy === 'alt') result.sort((a, b) => (a.alt || '').localeCompare(b.alt || ''));
    else if (sortBy === 'disabled') result.sort((a,b) => {
      if (a.disabled === b.disabled) return 1;
        return a.disabled ? -1 : 1;
    })
    return result;
  })();
  const isFiltered = !!search || sortBy !== 'order' || typeFilter !== 'all' || noThumbOnly;

  const visibleCount = images.filter(img => !img.disabled).length;
  const hiddenCount = images.length - visibleCount;
  const selectedCount = selected.size;

  return (
    <div className="space-y-6">
      {/* Status bar */}
      {status && (
        <div className={`px-4 py-2 rounded text-sm font-medium ${
          status.isError
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'bg-lime-100 text-lime-800 border border-lime-300'
        }`}>
          {status.msg}
        </div>
      )}

      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
          isDragOver ? 'border-lime-500 bg-lime-50' : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        {uploading ? (
          <div className="w-full max-w-sm mx-auto space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="truncate max-w-[200px]" title={uploadProgress.fileName}>
                {uploadProgress.fileName}
              </span>
              <span className="shrink-0 ml-2 text-gray-400 text-xs">
                {uploadProgress.fileCount > 1 ? `File ${uploadProgress.fileIndex} of ${uploadProgress.fileCount}` : ''}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-lime-500 h-3 rounded-full transition-all duration-150"
                style={{ width: `${uploadProgress.current}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center">{uploadProgress.current}%</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-3">📷</div>
            <p className="text-gray-600 mb-3">Drop images or videos here, or</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP, GIF — max 20 MB &nbsp;|&nbsp; MP4, MOV, WebM — max 500 MB</p>
            <label className="inline-flex items-center gap-1.5 mt-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={importAsWebp}
                onChange={e => setImportAsWebp(e.target.checked)}
                className="w-4 h-4 accent-lime-600"
              />
              <span className="text-xs text-gray-500">Convert to WebP / MP4 on import</span>
            </label>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Gallery grid */}
      {images.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No images yet. Upload some above.</p>
      ) : (
        <>
          {/* Search + Sort + Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or alt text…"
              className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-[180px] outline-none focus:border-lime-400"
            />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-lime-400 bg-white"
            >
              <option value="all">All Types</option>
              <option value="images">Images Only</option>
              <option value="videos">Videos Only</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-lime-400 bg-white"
            >
              <option value="order">Gallery Order</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="alt">Alt Text A–Z</option>
              <option value="disabled">Hidden</option>
            </select>
            <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noThumbOnly}
                onChange={e => setNoThumbOnly(e.target.checked)}
                className="accent-lime-600"
              />
              No thumbnail
            </label>
            {isFiltered && (
              <button onClick={() => { setSearch(''); setSortBy('order'); setTypeFilter('all'); setNoThumbOnly(false); }} className="text-xs text-gray-400 hover:text-gray-600">
                ✕ Reset
              </button>
            )}
          </div>
          {isFiltered && (
            <p className="text-xs text-gray-400">
              Showing {displayImages.length} of {images.length} — drag reorder disabled while filtering
            </p>
          )}

          {/* Stats + bulk controls row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">
                {visibleCount} visible, {hiddenCount} hidden
              </p>
              <button
                onClick={selectedCount === images.length ? clearSelection : selectAll}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                {selectedCount === images.length ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {images.some(img => !img.thumbUrl && !img.filename.endsWith('.thumb.webp')) && (
                <button
                  onClick={handleGenerateThumbnails}
                  disabled={generatingThumbs}
                  className="text-sm bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 px-3 py-1.5 rounded font-medium disabled:opacity-50 transition-colors"
                >
                  {generatingThumbs ? 'Generating…' : 'Generate Missing Thumbnails'}
                </button>
              )}
              {images.some(img => !img.filename.toLowerCase().endsWith('.webp') && !/\.(mp4|mov|webm)$/i.test(img.filename)) && (
                <button
                  onClick={handleConvertAll}
                  disabled={convertingAll}
                  className="text-sm bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-3 py-1.5 rounded font-medium disabled:opacity-50 transition-colors"
                >
                  {convertingAll ? 'Converting…' : 'Convert All to WebP'}
                </button>
              )}
            </div>
          </div>

          {/* Bulk action bar */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
              <span className="text-sm font-medium text-blue-700 mr-1">
                {selectedCount} selected
              </span>
              <button
                onClick={handleMoveToTop}
                className="text-xs bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                </svg>
                Move to Top
              </button>
              <button
                onClick={handleMoveToBottom}
                className="text-xs bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7M19 5l-7 7-7-7" />
                </svg>
                Move to Bottom
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={bulkDeleting}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded font-medium disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {bulkDeleting ? 'Deleting…' : `Delete ${selectedCount}`}
              </button>
              <button
                onClick={clearSelection}
                className="text-xs text-blue-500 hover:text-blue-700 ml-auto"
              >
                ✕ Clear
              </button>
            </div>
          )}

          <DndContext
            id="gallery-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={displayImages.map(img => img.filename)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayImages.map(image => (
                  <SortableImage
                    key={image.filename}
                    image={image}
                    selected={selected.has(image.filename)}
                    selecting={selected.size > 0}
                    onSelect={toggleSelect}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onToggleDisabled={handleToggleDisabled}
                    onConvert={handleConvert}
                    onConvertVideo={handleConvertVideo}
                    onRotate={handleRotate}
                    onAltUpdate={handleAltUpdate}
                    onGenerateThumb={handleGenerateSingleThumbnail}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
              {activeId ? (() => {
                const img = images.find(i => i.filename === activeId);
                if (!img) return null;
                return (
                  <div className="rounded-lg shadow-2xl border-2 border-blue-400 overflow-hidden rotate-1 scale-105 cursor-grabbing">
                    {/\.(mp4|mov|webm)$/i.test(img.filename) ? (
                      img.thumbUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={img.thumbUrl} alt={img.filename} className="w-full aspect-square object-cover" />
                      ) : (
                        /* eslint-disable-next-line jsx-a11y/media-has-caption */
                        <video src={img.url} muted preload="metadata" className="w-full aspect-square object-cover" />
                      )
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={img.url} alt={img.filename} className="w-full aspect-square object-cover" />
                    )}
                    <div className="p-2 bg-white">
                      <span className="text-xs text-gray-600 truncate block">{img.filename}</span>
                    </div>
                  </div>
                );
              })() : null}
            </DragOverlay>
          </DndContext>
        </>
      )}
    </div>
  );
}
