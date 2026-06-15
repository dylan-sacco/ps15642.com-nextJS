'use client';

import { useState } from 'react';

const DURATION_PRESETS = [
  { label: '1 hour', hours: 1 },
  { label: '6 hours', hours: 6 },
  { label: '24 hours', hours: 24 },
  { label: '7 days', hours: 168 },
  { label: '30 days', hours: 720 },
  { label: 'Custom…', hours: 'custom' },
];

function formatExpiry(expiresAt) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h remaining`;
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

export default function WhitelistManager({ initialEntries }) {
  const [entries, setEntries] = useState(
    initialEntries.map(e => ({ ...e, expired: new Date(e.expiresAt).getTime() < Date.now() }))
  );
  const [ip, setIp] = useState('');
  const [label, setLabel] = useState('');
  const [preset, setPreset] = useState(24);
  const [customHours, setCustomHours] = useState('');
  const [status, setStatus] = useState('');

  function showStatus(msg, isError = false) {
    setStatus({ msg, isError });
    setTimeout(() => setStatus(''), 4000);
  }

  const isCustom = preset === 'custom';
  const durationHours = isCustom ? Number(customHours) : preset;

  async function handleAdd(e) {
    e.preventDefault();
    if (isCustom && (!customHours || isNaN(Number(customHours)) || Number(customHours) <= 0)) {
      showStatus('Enter a valid number of hours', true);
      return;
    }

    const res = await fetch('/api/admin/whitelist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, label, durationHours }),
    });
    const data = await res.json();
    if (!res.ok) { showStatus(data.error, true); return; }

    const newEntry = { ip, label, expiresAt: data.expiresAt, expired: false };
    setEntries(prev => [...prev.filter(e => e.ip !== ip), newEntry]);
    setIp('');
    setLabel('');
    showStatus(`${ip} whitelisted until ${new Date(data.expiresAt).toLocaleString()}`);
  }

  async function handleRemove(targetIp) {
    const res = await fetch('/api/admin/whitelist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: targetIp }),
    });
    if (!res.ok) { showStatus('Failed to remove', true); return; }
    setEntries(prev => prev.filter(e => e.ip !== targetIp));
    showStatus(`${targetIp} removed from whitelist`);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {status && (
        <div className={`px-4 py-2 rounded text-sm font-medium ${
          status.isError
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'bg-lime-100 text-lime-800 border border-lime-300'
        }`}>
          {status.msg}
        </div>
      )}

      {/* Whitelist table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-scroll">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 text-gray-600 font-medium">IP / CIDR Range</th>
              <th className="text-left px-4 py-2 text-gray-600 font-medium">Label</th>
              <th className="text-left px-4 py-2 text-gray-600 font-medium">Expires</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                  No whitelisted IPs
                </td>
              </tr>
            ) : entries.map(entry => (
              <tr
                key={entry.ip}
                className={`border-t border-gray-100 ${entry.expired ? 'opacity-50' : ''}`}
              >
                <td className={`px-4 py-2 font-mono text-xs ${entry.expired ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {entry.ip}
                </td>
                <td className="px-4 py-2 text-gray-600">{entry.label || '—'}</td>
                <td className={`px-4 py-2 text-xs ${entry.expired ? 'text-red-400' : 'text-gray-500'}`}>
                  {formatExpiry(entry.expiresAt)}
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleRemove(entry.ip)}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add entry form */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Add IP or Range to Whitelist</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex flex-col-reverse md:grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                IP Address or CIDR Range
              </label>
              <input
                value={ip}
                onChange={e => setIp(e.target.value.trim())}
                placeholder="203.0.113.45 or 203.0.113.0/24"
                required
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-lime-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                CIDR ranges supported — e.g. <span className="font-mono">100.64.0.0/10</span> for carrier-grade NAT,{' '}
                <span className="font-mono">0.0.0.0/0</span> to allow all IPs temporarily.
              </p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Label (optional)</label>
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Work laptop"
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Duration</label>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map(p => (
                <button
                  key={p.hours}
                  type="button"
                  onClick={() => setPreset(p.hours)}
                  className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                    preset === p.hours
                      ? 'bg-lime-600 text-white border-lime-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-lime-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {isCustom && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={customHours}
                  onChange={e => setCustomHours(e.target.value)}
                  placeholder="Hours"
                  className="w-28 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
                />
                <span className="text-sm text-gray-500">hours</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
          >
            Add to Whitelist
          </button>
        </form>
      </div>
    </div>
  );
}
