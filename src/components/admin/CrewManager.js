'use client';

import { useState } from 'react';
import GalleryPickerInput from '@/components/admin/GalleryPickerInput';

const EMPTY_FORM = {
  name: '',
  title: '',
  image: '',
  description: '',
  phone: '',
  email: '',
  visible: true,
};

export default function CrewManager({ initialData, canManage }) {
  const [sectionVisible, setSectionVisible] = useState(initialData.sectionVisible);
  const [sectionTitle,    setSectionTitle]   = useState(initialData.title    ?? 'Meet the Team');
  const [sectionSubtitle, setSectionSubtitle] = useState(initialData.subtitle ?? 'The people who make it happen');
  const [members, setMembers] = useState(initialData.members);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function showMsg(msg, isError = false) {
    setStatus({ msg, isError });
    setTimeout(() => setStatus(null), 4000);
  }

  function startEdit(member) {
    setForm({
      name:        member.name,
      title:       member.title,
      image:       member.image || '',
      description: member.description || '',
      phone:       member.phone || '',
      email:       member.email || '',
      visible:     member.visible,
    });
    setEditingId(member.id);
    setShowForm(true);
  }

  function cancelForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setStatus(null);
  }

  // ── Section heading (title + subtitle) ────────────────────────────────────

  async function handleSaveHeading(e) {
    e.preventDefault();
    const res = await fetch('/api/admin/crew', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: sectionTitle, subtitle: sectionSubtitle }),
    });
    if (!res.ok) { showMsg('Failed to save heading', true); return; }
    showMsg('Section heading saved');
  }

  // ── Section visibility toggle ──────────────────────────────────────────────

  async function handleToggleSection() {
    const next = !sectionVisible;
    const res = await fetch('/api/admin/crew', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionVisible: next }),
    });
    if (!res.ok) { showMsg('Failed to update visibility', true); return; }
    setSectionVisible(next);
  }

  // ── Add / edit form ────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body   = editingId ? { id: editingId, ...form } : form;

      const res = await fetch('/api/admin/crew', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { showMsg(data.error || 'Error saving', true); return; }

      if (editingId) {
        setMembers(prev => prev.map(m => m.id === editingId ? { ...m, ...form } : m));
        showMsg(`${form.name} updated`);
      } else {
        setMembers(prev => [...prev, data.member]);
        showMsg(`${data.member.name} added`);
      }
      cancelForm();
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete(member) {
    if (!confirm(`Remove "${member.name}" from the team?`)) return;
    const res = await fetch('/api/admin/crew', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: member.id }),
    });
    if (!res.ok) { showMsg('Failed to delete', true); return; }
    setMembers(prev => prev.filter(m => m.id !== member.id));
    showMsg(`${member.name} removed`);
  }

  // ── Reorder ───────────────────────────────────────────────────────────────

  async function handleMove(id, direction) {
    const idx = members.findIndex(m => m.id === id);
    if (idx === -1) return;
    const next = [...members];
    const swapWith = direction === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    setMembers(next);

    await fetch('/api/admin/crew', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorder: next.map(m => m.id) }),
    });
  }

  // ── Toggle individual member visibility ──────────────────────────────────

  async function handleToggleMember(member) {
    const next = !member.visible;
    const res = await fetch('/api/admin/crew', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: member.id, visible: next }),
    });
    if (!res.ok) return;
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, visible: next } : m));
  }

  return (
    <div className="space-y-5 max-w-2xl">

      {/* Status banner */}
      {status && (
        <div className={`px-4 py-2 rounded text-sm font-medium ${
          status.isError
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'bg-lime-100 text-lime-800 border border-lime-300'
        }`}>
          {status.msg}
        </div>
      )}

      {/* Section visibility toggle */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">Section Visibility</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Controls whether "Meet the Team" appears on the About page
          </p>
        </div>
        {canManage ? (
          <button
            onClick={handleToggleSection}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              sectionVisible
                ? 'bg-lime-100 text-lime-700 border-lime-300 hover:bg-lime-200'
                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
            }`}
          >
            {sectionVisible ? '● Visible' : '○ Hidden'}
          </button>
        ) : (
          <span className={`px-3 py-1.5 rounded text-xs font-medium border ${
            sectionVisible
              ? 'bg-lime-50 text-lime-700 border-lime-200'
              : 'bg-gray-50 text-gray-500 border-gray-200'
          }`}>
            {sectionVisible ? '● Visible' : '○ Hidden'}
          </span>
        )}
      </div>

      {/* Section heading */}
      {canManage && (
        <form
          onSubmit={handleSaveHeading}
          className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
        >
          <h2 className="text-sm font-semibold text-gray-700">Section Heading</h2>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              value={sectionTitle}
              onChange={e => setSectionTitle(e.target.value)}
              placeholder="Meet the Team"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
            <input
              value={sectionSubtitle}
              onChange={e => setSectionSubtitle(e.target.value)}
              placeholder="The people who make it happen"
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
            />
          </div>
          <button
            type="submit"
            className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Save Heading
          </button>
        </form>
      )}

      {/* Add member button */}
      {canManage && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          + Add Member
        </button>
      )}

      {/* Add / Edit form */}
      {showForm && canManage && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg p-6 space-y-4"
        >
          <h2 className="font-semibold text-gray-800">
            {editingId ? 'Edit Member' : 'Add Team Member'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input
                required
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                placeholder="Dave Smith"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input
                required
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                placeholder="Owner & Lead Landscaper"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Photo</label>
            <GalleryPickerInput
              value={form.image}
              onChange={url => setField('image', url)}
              placeholder="Select from gallery or paste URL"
            />
            {form.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.image}
                alt="Preview"
                className="mt-2 w-16 h-16 rounded-full object-cover border border-gray-200"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Bio / Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
              placeholder="A short bio about this team member..."
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm resize-none focus:outline-none focus:border-lime-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setField('phone', e.target.value)}
                placeholder="(724) 382-8201"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email (optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                placeholder="name@example.com"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={e => setField('visible', e.target.checked)}
              className="accent-lime-600"
            />
            Show this member on the About page
          </label>

          {status?.isError && (
            <p className="text-red-500 text-sm">{status.msg}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="bg-lime-600 hover:bg-lime-700 disabled:opacity-60 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
            >
              {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Member'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="text-gray-500 hover:text-gray-700 px-4 py-1.5 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Member list */}
      {members.length === 0 ? (
        <p className="text-gray-400 text-sm py-2">
          No team members yet. Add one above.
        </p>
      ) : (
        <div className="space-y-2">
          {members.map((member, idx) => (
            <div
              key={member.id}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-4"
            >
              {/* Photo */}
              {member.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/>
                  </svg>
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-gray-800">{member.name}</span>
                  <span className="text-xs text-gray-400">{member.title}</span>
                  {!member.visible && (
                    <span className="text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                      Hidden
                    </span>
                  )}
                </div>
                {member.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{member.description}</p>
                )}
              </div>

              {/* Actions */}
              {canManage && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Reorder */}
                  <button
                    onClick={() => handleMove(member.id, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-25 hover:bg-gray-50 transition-colors"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMove(member.id, 'down')}
                    disabled={idx === members.length - 1}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 disabled:opacity-25 hover:bg-gray-50 transition-colors"
                    title="Move down"
                  >
                    ↓
                  </button>

                  {/* Visibility toggle */}
                  <button
                    onClick={() => handleToggleMember(member)}
                    className={`ml-1 text-xs px-2 py-1 rounded border transition-colors ${
                      member.visible
                        ? 'border-lime-300 text-lime-700 hover:bg-lime-50'
                        : 'border-gray-300 text-gray-400 hover:bg-gray-50'
                    }`}
                    title={member.visible ? 'Click to hide' : 'Click to show'}
                  >
                    {member.visible ? 'Visible' : 'Hidden'}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => startEdit(member)}
                    className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(member)}
                    className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                  >
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
