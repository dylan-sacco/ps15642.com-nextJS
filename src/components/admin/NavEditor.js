'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus, GripVertical } from 'lucide-react';

function newItem() {
  return { name: '', href: '/', dropdown: null };
}
function newDropdownItem() {
  return { name: '', href: '/' };
}

export default function NavEditor({ initialItems }) {
  const [items, setItems] = useState(initialItems.map(i => ({ ...i, dropdown: i.dropdown ? [...i.dropdown] : null })));
  const [expanded, setExpanded] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  function showStatus(msg, isError = false) {
    setStatus({ msg, isError });
    setTimeout(() => setStatus(null), 3500);
  }

  // ── Top-level item helpers ─────────────────────────────────────────────────

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }

  function moveItem(idx, dir) {
    setItems(prev => {
      const next = [...prev];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  }

  function deleteItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  function addItem() {
    setItems(prev => [...prev, newItem()]);
  }

  function toggleDropdown(idx) {
    setItems(prev => prev.map((it, i) =>
      i !== idx ? it : { ...it, dropdown: it.dropdown ? null : [newDropdownItem()] }
    ));
    setExpanded(prev => ({ ...prev, [idx]: true }));
  }

  // ── Dropdown item helpers ──────────────────────────────────────────────────

  function updateDropdownItem(parentIdx, childIdx, field, value) {
    setItems(prev => prev.map((it, i) => {
      if (i !== parentIdx || !it.dropdown) return it;
      const next = it.dropdown.map((d, j) => j === childIdx ? { ...d, [field]: value } : d);
      return { ...it, dropdown: next };
    }));
  }

  function moveDropdownItem(parentIdx, childIdx, dir) {
    setItems(prev => prev.map((it, i) => {
      if (i !== parentIdx || !it.dropdown) return it;
      const next = [...it.dropdown];
      const swap = childIdx + dir;
      if (swap < 0 || swap >= next.length) return it;
      [next[childIdx], next[swap]] = [next[swap], next[childIdx]];
      return { ...it, dropdown: next };
    }));
  }

  function deleteDropdownItem(parentIdx, childIdx) {
    setItems(prev => prev.map((it, i) => {
      if (i !== parentIdx || !it.dropdown) return it;
      const next = it.dropdown.filter((_, j) => j !== childIdx);
      return { ...it, dropdown: next.length ? next : null };
    }));
  }

  function addDropdownItem(parentIdx) {
    setItems(prev => prev.map((it, i) => {
      if (i !== parentIdx) return it;
      return { ...it, dropdown: [...(it.dropdown || []), newDropdownItem()] };
    }));
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    for (const item of items) {
      if (!item.name.trim()) return showStatus('All items must have a name.', true);
      if (!item.href.trim()) return showStatus('All items must have a link (href).', true);
      if (item.dropdown) {
        for (const d of item.dropdown) {
          if (!d.name.trim() || !d.href.trim()) return showStatus('All dropdown items must have a name and link.', true);
        }
      }
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/nav', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      showStatus('Navigation saved. Reload the site to see changes.');
    } catch (err) {
      showStatus(err.message, true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Navigation</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-lime-600 hover:bg-lime-700 disabled:opacity-50 text-white px-5 py-2 rounded font-medium text-sm transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {status && (
        <div className={`mb-4 px-4 py-2.5 rounded text-sm font-medium ${status.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-lime-50 text-lime-700 border border-lime-200'}`}>
          {status.msg}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            {/* Top-level item row */}
            <div className="flex items-center gap-2 p-3">
              <GripVertical size={16} className="text-gray-300 shrink-0" />

              <input
                value={item.name}
                onChange={e => updateItem(idx, 'name', e.target.value)}
                placeholder="Label"
                className="flex-1 min-w-0 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-lime-400"
              />

              <input
                value={item.href}
                onChange={e => updateItem(idx, 'href', e.target.value)}
                placeholder="/page"
                className="flex-1 min-w-0 text-sm border border-gray-200 rounded px-2 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-lime-400"
              />

              {/* Default link hint for dropdown items */}
              {item.dropdown && (
                <span className="text-xs text-gray-400 shrink-0 hidden sm:block">← default</span>
              )}

              <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-20">
                <ChevronUp size={16} />
              </button>
              <button onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-20">
                <ChevronDown size={16} />
              </button>

              <button
                onClick={() => toggleDropdown(idx)}
                title={item.dropdown ? 'Remove dropdown' : 'Add dropdown'}
                className={`text-xs px-2 py-1 rounded border transition-colors shrink-0 ${item.dropdown ? 'border-lime-400 text-lime-700 bg-lime-50 hover:bg-lime-100' : 'border-gray-200 text-gray-500 hover:border-lime-400 hover:text-lime-700'}`}
              >
                {item.dropdown ? '▾ Drop' : '+ Drop'}
              </button>

              {item.dropdown && (
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown size={16} className={`transition-transform ${expanded[idx] ? 'rotate-180' : ''}`} />
                </button>
              )}

              <button onClick={() => deleteItem(idx)} className="text-red-400 hover:text-red-600 shrink-0">
                <Trash2 size={16} />
              </button>
            </div>

            {/* Dropdown items */}
            {item.dropdown && expanded[idx] && (
              <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 space-y-2">
                <p className="text-xs text-gray-400 mb-1">
                  Dropdown items — the <span className="font-semibold">href above</span> is where clicking the top-level label goes (default link).
                </p>
                {item.dropdown.map((d, didx) => (
                  <div key={didx} className="flex items-center gap-2">
                    <input
                      value={d.name}
                      onChange={e => updateDropdownItem(idx, didx, 'name', e.target.value)}
                      placeholder="Label"
                      className="flex-1 min-w-0 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-lime-400 bg-white"
                    />
                    <input
                      value={d.href}
                      onChange={e => updateDropdownItem(idx, didx, 'href', e.target.value)}
                      placeholder="/page"
                      className="flex-1 min-w-0 text-sm border border-gray-200 rounded px-2 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-lime-400 bg-white"
                    />
                    <button onClick={() => moveDropdownItem(idx, didx, -1)} disabled={didx === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-20">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => moveDropdownItem(idx, didx, 1)} disabled={didx === item.dropdown.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-20">
                      <ChevronDown size={14} />
                    </button>
                    <button onClick={() => deleteDropdownItem(idx, didx)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addDropdownItem(idx)}
                  className="flex items-center gap-1 text-xs text-lime-700 hover:text-lime-900 transition-colors mt-1"
                >
                  <Plus size={13} /> Add dropdown item
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="mt-4 flex items-center gap-1.5 text-sm text-lime-700 hover:text-lime-900 transition-colors font-medium"
      >
        <Plus size={16} /> Add nav item
      </button>
    </div>
  );
}
