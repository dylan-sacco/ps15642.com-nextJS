'use client';

import { useState } from 'react';

export default function ContactManager({ initialSubmissions, canDelete }) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [expanded, setExpanded] = useState(null);

  async function handleExpand(id) {
    if (expanded === id) {
      setExpanded(null);
      return;
    }
    setExpanded(id);
    const sub = submissions.find(s => s.id === id);
    if (sub && !sub.read) {
      await fetch('/api/admin/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, read: true } : s));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    const res = await fetch('/api/admin/contact', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setSubmissions(prev => prev.filter(s => s.id !== id));
      if (expanded === id) setExpanded(null);
    }
  }

  const unreadCount = submissions.filter(s => !s.read).length;

  if (submissions.length === 0) {
    return (
      <p className="text-gray-500 text-sm mt-4">No contact submissions yet.</p>
    );
  }

  return (
    <div>
      {unreadCount > 0 && (
        <p className="text-sm text-lime-700 font-medium mb-4">
          {unreadCount} unread submission{unreadCount !== 1 ? 's' : ''}
        </p>
      )}
      <div className="space-y-2">
        {submissions.map(sub => (
          <div
            key={sub.id}
            className={`border rounded-lg overflow-hidden ${sub.read ? 'border-gray-200 bg-white' : 'border-lime-400 bg-lime-50'}`}
          >
            {/* Row header */}
            <button
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              onClick={() => handleExpand(sub.id)}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.read ? 'bg-gray-300' : 'bg-lime-500'}`} />
              <span className="text-sm font-medium text-gray-900 w-40 truncate">{sub.name || '(no name)'}</span>
              <span className="text-sm text-gray-500 w-48 truncate hidden sm:block">{sub.email}</span>
              <span className="text-sm text-gray-400 truncate flex-1 hidden md:block">{sub.message?.slice(0, 60)}{sub.message?.length > 60 ? '…' : ''}</span>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">
                {new Date(sub.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-gray-400 text-xs ml-2">{expanded === sub.id ? '▲' : '▼'}</span>
            </button>

            {/* Expanded detail */}
            {expanded === sub.id && (
              <div className="border-t border-gray-200 px-4 py-4 bg-white">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                  <div><dt className="text-gray-500 font-medium">Name</dt><dd className="text-gray-900">{sub.name || '—'}</dd></div>
                  <div><dt className="text-gray-500 font-medium">Email</dt><dd className="text-gray-900">{sub.email || '—'}</dd></div>
                  <div><dt className="text-gray-500 font-medium">Phone</dt><dd className="text-gray-900">{sub.phone || '—'}</dd></div>
                  <div>
                    <dt className="text-gray-500 font-medium">Address</dt>
                    <dd className="text-gray-900">
                      {[sub.address, sub.city, sub.state, sub.zip].filter(Boolean).join(', ') || '—'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500 font-medium">Message</dt>
                    <dd className="text-gray-900 whitespace-pre-wrap">{sub.message || '—'}</dd>
                  </div>
                  <div><dt className="text-gray-500 font-medium">Submitted</dt><dd className="text-gray-900">{new Date(sub.submittedAt).toLocaleString()}</dd></div>
                </dl>
                {canDelete && (
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="text-xs text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1 rounded transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
