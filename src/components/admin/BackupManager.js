'use client';

import { useState } from 'react';

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoOrName) {
  // Try ISO first, fall back to parsing the name format YYYY-MM-DD_HH-MM-SS
  const d = new Date(isoOrName);
  if (!isNaN(d)) return d.toLocaleString();
  // Parse name format
  const m = isoOrName.match(/^(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})$/);
  if (m) return new Date(m[1], m[2]-1, m[3], m[4], m[5], m[6]).toLocaleString();
  return isoOrName;
}

function StorageBar({ usedBytes, limitBytes }) {
  const pct = limitBytes > 0 ? Math.min((usedBytes / limitBytes) * 100, 100) : 0;
  const color = pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-lime-500';
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Storage Used</span>
        <span className="text-sm text-gray-500">
          {formatBytes(usedBytes)} <span className="text-gray-400">/</span> {formatBytes(limitBytes)}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{pct.toFixed(1)}% of limit used</p>
    </div>
  );
}

export default function BackupManager({ initialBackups, initialUsedBytes, limitBytes, canManage }) {
  const [backups,   setBackups]   = useState(initialBackups);
  const [usedBytes, setUsedBytes] = useState(initialUsedBytes);
  const [label,     setLabel]     = useState('');
  const [status,    setStatus]    = useState(null);
  const [busy,      setBusy]      = useState(false); // creating
  const [restoring, setRestoring] = useState(null); // `${name}_gallery` | `${name}_blog`
  const [deleting,  setDeleting]  = useState(null); // name

  function showStatus(msg, isError = false) {
    setStatus({ msg, isError });
    setTimeout(() => setStatus(null), 5000);
  }

  async function handleCreate() {
    setBusy(true);
    try {
      const res  = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      });
      const data = await res.json();
      if (!res.ok) { showStatus(data.error, true); return; }
      showStatus('Backup created successfully.');
      setLabel('');
      // Refresh list from server
      await refreshBackups();
    } catch {
      showStatus('Network error — backup may not have completed.', true);
    } finally {
      setBusy(false);
    }
  }

  async function refreshBackups() {
    try {
      const res  = await fetch('/api/admin/backup');
      const data = await res.json();
      if (res.ok) {
        setBackups(data.backups);
        setUsedBytes(data.usedBytes);
      }
    } catch {}
  }

  async function handleRestore(name, target) {
    const label = target === 'gallery' ? 'Gallery' : 'Articles';
    if (!window.confirm(`Restore ${label} from backup "${name}"?\nThis will overwrite the current ${label.toLowerCase()} with the backup copy.`)) return;
    setRestoring(`${name}_${target}`);
    try {
      const res  = await fetch(`/api/admin/backup/${name}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (!res.ok) { showStatus(data.error, true); return; }
      showStatus(`${label} restored from "${name}".`);
    } catch {
      showStatus('Network error during restore.', true);
    } finally {
      setRestoring(null);
    }
  }

  async function handleDelete(name) {
    if (!window.confirm(`Permanently delete backup "${name}"? This cannot be undone.`)) return;
    setDeleting(name);
    try {
      const res  = await fetch(`/api/admin/backup/${name}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { showStatus(data.error, true); return; }
      setBackups(prev => prev.filter(b => b.name !== name));
      setUsedBytes(prev => {
        const removed = backups.find(b => b.name === name)?.totalSize ?? 0;
        return Math.max(0, prev - removed);
      });
      showStatus(`Backup "${name}" deleted.`);
    } catch {
      showStatus('Network error during delete.', true);
    } finally {
      setDeleting(null);
    }
  }

  const atLimit = usedBytes >= limitBytes;

  return (
    <div className="space-y-4 max-w-2xl">
      {status && (
        <div className={`px-4 py-2 rounded text-sm font-medium ${
          status.isError
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'bg-lime-100 text-lime-800 border border-lime-300'
        }`}>
          {status.msg}
        </div>
      )}

      <StorageBar usedBytes={usedBytes} limitBytes={limitBytes} />

      {/* Create backup */}
      {canManage && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Create New Backup</h2>
          <div className="flex gap-2">
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Optional label (e.g. before redesign)"
              maxLength={80}
              className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
            />
            <button
              onClick={handleCreate}
              disabled={busy || atLimit}
              title={atLimit ? 'Storage limit reached — delete older backups first' : ''}
              className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {busy ? 'Backing up…' : 'Create Backup'}
            </button>
          </div>
          {atLimit && (
            <p className="text-xs text-red-500 mt-2">Storage limit reached. Delete older backups to create a new one.</p>
          )}
        </div>
      )}

      {/* Backup list */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">
            {backups.length === 0 ? 'No backups yet' : `${backups.length} backup${backups.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {backups.length === 0 ? (
          <div className="px-4 py-10 text-center text-gray-400 text-sm">
            No backups yet. Create one above.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {backups.map(b => {
              const isDeleting  = deleting === b.name;
              const isRestGal   = restoring === `${b.name}_gallery`;
              const isRestArt   = restoring === `${b.name}_blog`;
              const anyBusy     = !!restoring || !!deleting || busy;

              return (
                <li key={b.name} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">{formatDate(b.created)}</span>
                      {b.label && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{b.label}</span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-0.5 text-xs text-gray-400">
                      <span>Gallery: {formatBytes(b.gallerySize)}</span>
                      <span>Blog: {formatBytes(b.blogSize)}</span>
                      <span className="font-medium text-gray-500">Total: {formatBytes(b.totalSize)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {canManage && (
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => handleRestore(b.name, 'gallery')}
                        disabled={anyBusy}
                        className="text-xs px-2.5 py-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {isRestGal ? 'Restoring…' : 'Restore Gallery'}
                      </button>
                      <button
                        onClick={() => handleRestore(b.name, 'blog')}
                        disabled={anyBusy}
                        className="text-xs px-2.5 py-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {isRestArt ? 'Restoring…' : 'Restore Blog'}
                      </button>
                      <button
                        onClick={() => handleDelete(b.name)}
                        disabled={anyBusy}
                        className="text-xs px-2.5 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        {isDeleting ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
