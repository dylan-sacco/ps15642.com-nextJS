'use client';

import { useState } from 'react';
import GalleryPickerInput from './GalleryPickerInput';

const EMPTY = { title: '', description: '', beforeImage: '', afterImage: '', category: '', date: '' };

export default function BeforeAfterManager({ initialPairs, canManage }) {
  const [pairs, setPairs] = useState(initialPairs);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState(null);

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function startEdit(p) {
    setForm({ title: p.title, description: p.description, beforeImage: p.beforeImage, afterImage: p.afterImage, category: p.category, date: p.date });
    setEditingId(p.id);
    setShowForm(true);
  }

  function cancelForm() { setForm(EMPTY); setEditingId(null); setShowForm(false); setStatus(null); }

  async function handleSubmit(e) {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...form } : form;
    const res = await fetch('/api/admin/before-after', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) { setStatus(data.error || 'Error saving'); return; }
    if (editingId) {
      setPairs(prev => prev.map(p => p.id === editingId ? { ...p, ...form } : p));
    } else {
      setPairs(prev => [data.pair, ...prev]);
    }
    cancelForm();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this pair?')) return;
    const res = await fetch('/api/admin/before-after', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setPairs(prev => prev.filter(p => p.id !== id));
  }

  return (
    <div>
      {canManage && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="mb-6 bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded text-sm transition-colors">
          + Add Before/After Pair
        </button>
      )}

      {showForm && canManage && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-4 max-w-xl">
          <h2 className="font-semibold text-gray-800">{editingId ? 'Edit Pair' : 'New Before/After Pair'}</h2>
          <p className="text-xs text-gray-500">Pick images from the gallery or paste a URL directly.</p>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input value={form.title} onChange={e => setField('title', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Backyard Hardscape Rebuild" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Before Image *</label>
              <GalleryPickerInput
                required
                value={form.beforeImage}
                onChange={v => setField('beforeImage', v)}
                placeholder="/api/uploads/before1"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">After Image *</label>
              <GalleryPickerInput
                required
                value={form.afterImage}
                onChange={v => setField('afterImage', v)}
                placeholder="/api/uploads/after1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <input value={form.category} onChange={e => setField('category', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Hardscape" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setField('date', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => setField('description', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm resize-none"
              placeholder="Brief description of the project…" />
          </div>

          {status && <p className="text-red-500 text-sm">{status}</p>}
          <div className="flex gap-2">
            <button type="submit" className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-1.5 rounded text-sm transition-colors">
              {editingId ? 'Save Changes' : 'Add Pair'}
            </button>
            <button type="button" onClick={cancelForm} className="text-gray-500 hover:text-gray-700 px-4 py-1.5 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {pairs.length === 0 ? (
        <p className="text-gray-500 text-sm">No before/after pairs yet.</p>
      ) : (
        <div className="space-y-3">
          {pairs.map(p => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-4">
              <div className="flex gap-2 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.beforeImage} alt="before" className="w-14 h-10 object-cover rounded border" />
                <span className="text-gray-400 text-xs self-center">→</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.afterImage} alt="after" className="w-14 h-10 object-cover rounded border" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{p.title || '(untitled)'}</p>
                <p className="text-xs text-gray-400">{p.category} {p.date ? `· ${p.date}` : ''}</p>
              </div>
              {canManage && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(p)}
                    className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
