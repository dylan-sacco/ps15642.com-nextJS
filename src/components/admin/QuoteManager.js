'use client';

import { useState } from 'react';

const SERVICE_LABELS = {
  'lawn-care': 'Lawn Care',
  'landscaping': 'Landscaping',
  'hardscape': 'Hardscape',
  'tree-stump': 'Tree Service / Stump Grinding',
  'decks-railings': 'Decks & Railings',
  'other': 'Other',
};

export default function QuoteManager({ initialQuotes, canDelete }) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [expanded, setExpanded] = useState(null);

  async function handleExpand(id) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    const q = quotes.find(q => q.id === id);
    if (q && !q.read) {
      await fetch('/api/admin/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, read: true } : q));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this quote request? This cannot be undone.')) return;
    const res = await fetch('/api/admin/quotes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setQuotes(prev => prev.filter(q => q.id !== id));
      if (expanded === id) setExpanded(null);
    }
  }

  const unreadCount = quotes.filter(q => !q.read).length;

  if (quotes.length === 0) {
    return <p className="text-gray-500 text-sm mt-4">No quote requests yet.</p>;
  }

  return (
    <div>
      {unreadCount > 0 && (
        <p className="text-sm text-lime-700 font-medium mb-4">
          {unreadCount} unread request{unreadCount !== 1 ? 's' : ''}
        </p>
      )}
      <div className="space-y-2">
        {quotes.map(q => (
          <div key={q.id} className={`border rounded-lg overflow-hidden ${q.read ? 'border-gray-200 bg-white' : 'border-lime-400 bg-lime-50'}`}>
            <button
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              onClick={() => handleExpand(q.id)}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${q.read ? 'bg-gray-300' : 'bg-lime-500'}`} />
              <span className="text-sm font-medium text-gray-900 w-36 truncate">{q.name || '(no name)'}</span>
              <span className="text-xs text-lime-700 bg-lime-100 px-2 py-0.5 rounded hidden sm:block flex-shrink-0">
                {SERVICE_LABELS[q.serviceType] || q.serviceType || '—'}
              </span>
              <span className="text-sm text-gray-400 truncate flex-1 hidden md:block">{q.message?.slice(0, 60)}{q.message?.length > 60 ? '…' : ''}</span>
              <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">
                {new Date(q.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-gray-400 text-xs ml-2">{expanded === q.id ? '▲' : '▼'}</span>
            </button>

            {expanded === q.id && (
              <div className="border-t border-gray-200 px-4 py-4 bg-white">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                  <div><dt className="text-gray-500 font-medium">Name</dt><dd>{q.name || '—'}</dd></div>
                  <div><dt className="text-gray-500 font-medium">Service</dt><dd>{SERVICE_LABELS[q.serviceType] || q.serviceType || '—'}</dd></div>
                  <div><dt className="text-gray-500 font-medium">Email</dt><dd>{q.email || '—'}</dd></div>
                  <div><dt className="text-gray-500 font-medium">Phone</dt><dd>{q.phone || '—'}</dd></div>
                  <div>
                    <dt className="text-gray-500 font-medium">Address</dt>
                    <dd>{[q.address, q.city, q.state, q.zip].filter(Boolean).join(', ') || '—'}</dd>
                  </div>
                  <div><dt className="text-gray-500 font-medium">Desired Start</dt><dd>{q.startDate || '—'}</dd></div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500 font-medium">Description</dt>
                    <dd className="whitespace-pre-wrap">{q.message || '—'}</dd>
                  </div>
                  <div><dt className="text-gray-500 font-medium">Submitted</dt><dd>{new Date(q.submittedAt).toLocaleString()}</dd></div>
                </dl>
                {canDelete && (
                  <button onClick={() => handleDelete(q.id)}
                    className="text-xs text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 px-3 py-1 rounded transition-colors">
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
