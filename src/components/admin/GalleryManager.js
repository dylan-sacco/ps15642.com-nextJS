'use client';

import { useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
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

function SortableImage({ image, onRename, onDelete, onToggleDisabled }) {
  const { filename, url, disabled } = image;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: filename });

  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(filename);
  const inputRef = useRef(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  function startEdit() {
    setEditValue(filename);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function commitRename() {
    setEditing(false);
    const newName = editValue.trim();
    if (!newName || newName === filename) return;
    await onRename(filename, newName);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-lg shadow border overflow-hidden group ${
        disabled ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 cursor-grab active:cursor-grabbing bg-black/40 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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

      {/* Delete button */}
      <button
        onClick={() => onDelete(filename)}
        className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete image"
      >
        ✕
      </button>

      {/* Thumbnail */}
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={filename}
          className={`w-full aspect-square object-cover transition-all ${
            disabled ? 'opacity-40 grayscale' : ''
          }`}
          loading="lazy"
        />

        {/* "Hidden" badge */}
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-orange-500/90 text-white text-xs font-semibold px-2 py-0.5 rounded">
              Hidden
            </span>
          </div>
        )}
      </div>

      {/* Footer: filename + visibility toggle */}
      <div className="p-2 bg-white flex items-center gap-1">
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              className="w-full text-xs border border-lime-500 rounded px-1 py-0.5 outline-none"
            />
          ) : (
            <button
              onClick={startEdit}
              className="w-full text-left text-xs text-gray-600 hover:text-lime-700 truncate"
              title="Click to rename"
            >
              {filename}
            </button>
          )}
        </div>

        {/* Visibility toggle */}
        <button
          onClick={() => onToggleDisabled(filename, !disabled)}
          title={disabled ? 'Show in gallery' : 'Hide from gallery'}
          className={`shrink-0 p-1 rounded transition-colors ${
            disabled
              ? 'text-orange-500 hover:text-orange-700 hover:bg-orange-100'
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          }`}
        >
          {disabled ? (
            // Eye with slash (hidden)
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            // Eye (visible)
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function GalleryManager({ initialImages }) {
  const [images, setImages] = useState(initialImages);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function showStatus(msg, isError = false) {
    setStatus({ msg, isError });
    setTimeout(() => setStatus(''), 3000);
  }

  async function uploadFiles(files) {
    if (!files.length) return;
    setUploading(true);
    const formData = new FormData();
    for (const file of files) formData.append('files', file);

    try {
      const res = await fetch('/api/admin/gallery/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      const newImages = data.uploaded.map(name => ({
        filename: name,
        url: `/api/images/${name}`,
        disabled: false,
      }));
      setImages(prev => [...prev, ...newImages]);
      showStatus(`Uploaded ${data.uploaded.length} image(s)`);
    } catch (err) {
      showStatus(err.message, true);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    uploadFiles(files);
  }

  function handleFileInput(e) {
    uploadFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex(img => img.filename === active.id);
    const newIndex = images.findIndex(img => img.filename === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);
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
        prev.map(img =>
          img.filename === oldName
            ? { ...img, filename: data.newName, url: `/api/images/${data.newName}` }
            : img
        )
      );
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
      showStatus(`Deleted ${filename}`);
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

  const visibleCount = images.filter(img => !img.disabled).length;
  const hiddenCount = images.length - visibleCount;

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
        <div className="text-4xl mb-3">📷</div>
        <p className="text-gray-600 mb-3">{uploading ? 'Uploading…' : 'Drop images here, or'}</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded font-medium text-sm disabled:opacity-50 transition-colors"
        >
          Browse Files
        </button>
        <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP, GIF — max 20 MB each</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Gallery grid */}
      {images.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No images yet. Upload some above.</p>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {visibleCount} visible, {hiddenCount} hidden — drag to reorder, click filename to rename, eye icon to toggle visibility
          </p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map(img => img.filename)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map(image => (
                  <SortableImage
                    key={image.filename}
                    image={image}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    onToggleDisabled={handleToggleDisabled}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
