'use client';

import { useState } from 'react';

const EMPTY_FORM = { name: '', location: '', rating: 5, text: '', date: '', featured: false, source: 'manual' };

function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          className={`text-2xl leading-none ${n <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition`}>
          ★
        </button>
      ))}
    </div>
  );
}

export default function TestimonialManager({ initialTestimonials, canManage }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState(null);

  function setField(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function startEdit(t) {
    setForm({ name: t.name, location: t.location, rating: t.rating, text: t.text, date: t.date, featured: t.featured, source: t.source });
    setEditingId(t.id);
    setShowForm(true);
  }

  function cancelForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setStatus(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { id: editingId, ...form } : form;

    const res = await fetch('/api/admin/testimonials', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) { setStatus(data.error || 'Error saving'); return; }

    if (editingId) {
      setTestimonials(prev => prev.map(t => t.id === editingId ? { ...t, ...form } : t));
    } else {
      setTestimonials(prev => [data.testimonial, ...prev]);
    }
    cancelForm();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this testimonial?')) return;
    const res = await fetch('/api/admin/testimonials', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setTestimonials(prev => prev.filter(t => t.id !== id));
  }

  async function toggleFeatured(t) {
    const res = await fetch('/api/admin/testimonials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, featured: !t.featured }),
    });
    if (res.ok) setTestimonials(prev => prev.map(x => x.id === t.id ? { ...x, featured: !x.featured } : x));
  }

  return (
    <div>
      {canManage && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="mb-6 bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded text-sm transition-colors">
          + Add Testimonial
        </button>
      )}

      {showForm && canManage && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6 mb-6 space-y-4 max-w-xl">
          <h2 className="font-semibold text-gray-800">{editingId ? 'Edit Testimonial' : 'New Testimonial'}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input required value={form.name} onChange={e => setField('name', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="John S." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input value={form.location} onChange={e => setField('location', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" placeholder="Irwin, PA" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
              <StarPicker value={form.rating} onChange={v => setField('rating', v)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setField('date', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Review *</label>
            <textarea required rows={3} value={form.text} onChange={e => setField('text', e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm resize-none"
              placeholder="Great service, highly recommend..." />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={e => setField('featured', e.target.checked)} />
              Show on home page
            </label>
            <div>
              <select value={form.source} onChange={e => setField('source', e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm">
                <option value="manual">Manual</option>
                <option value="google">Google</option>
              </select>
            </div>
          </div>

          {status && <p className="text-red-500 text-sm">{status}</p>}

          <div className="flex gap-2">
            <button type="submit" className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-1.5 rounded text-sm transition-colors">
              {editingId ? 'Save Changes' : 'Add Testimonial'}
            </button>
            <button type="button" onClick={cancelForm} className="text-gray-500 hover:text-gray-700 px-4 py-1.5 text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {testimonials.length === 0 ? (
        <p className="text-gray-500 text-sm">No testimonials yet. Add the first one above.</p>
      ) : (
        <div className="space-y-3">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-gray-800">{t.name}</span>
                  {t.location && <span className="text-xs text-gray-400">{t.location}</span>}
                  {t.source === 'google' && <span className="text-xs text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">Google</span>}
                  {t.featured && <span className="text-xs text-lime-700 bg-lime-50 px-1.5 py-0.5 rounded">Featured</span>}
                  <span className="text-yellow-400 text-sm">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">"{t.text}"</p>
              </div>
              {canManage && (
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => toggleFeatured(t)}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${t.featured ? 'border-lime-400 text-lime-700 hover:bg-lime-50' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                    {t.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button onClick={() => startEdit(t)}
                    className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(t.id)}
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
