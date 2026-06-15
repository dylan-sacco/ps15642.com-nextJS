'use client';

import { useState } from 'react';
import { ROLES } from '@/config/roles';

const ROLE_COLORS = {
  admin:     'bg-red-100 text-red-700',
  owner:     'bg-purple-100 text-purple-700',
  publisher: 'bg-blue-100 text-blue-700',
  editor:    'bg-gray-100 text-gray-600',
};

function RoleBadge({ role }) {
  const label = ROLES[role]?.label ?? role;
  const color = ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${color}`}>{label}</span>
  );
}

export default function UserManager({ initialUsers, currentUsername, currentRole, rolesForSelect }) {
  const [users, setUsers] = useState(initialUsers);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(rolesForSelect[0]?.name ?? '');
  const [status, setStatus] = useState('');

  function showStatus(msg, isError = false) {
    setStatus({ msg, isError });
    setTimeout(() => setStatus(''), 4000);
  }

  function canDelete(targetUser) {
    if (targetUser.username === currentUsername) return false;
    if (users.length <= 1) return false;
    const actorLevel = ROLES[currentRole]?.level ?? 0;
    const targetLevel = ROLES[targetUser.role]?.level ?? 0;
    return actorLevel > targetLevel;
  }

  async function handleAdd(e) {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    });
    const data = await res.json();
    if (!res.ok) { showStatus(data.error, true); return; }
    setUsers(prev => [...prev, { username: data.username, role: data.role }]);
    setUsername('');
    setPassword('');
    showStatus(`User "${data.username}" created as ${ROLES[data.role]?.label ?? data.role}`);
  }

  async function handleDelete(targetUsername) {
    if (!window.confirm(`Delete user "${targetUsername}"?`)) return;
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: targetUsername }),
    });
    const data = await res.json();
    if (!res.ok) { showStatus(data.error, true); return; }
    setUsers(prev => prev.filter(u => u.username !== targetUsername));
    showStatus(`User "${targetUsername}" deleted`);
  }

  return (
    <div className="space-y-6 max-w-xl">
      {status && (
        <div className={`px-4 py-2 rounded text-sm font-medium ${
          status.isError
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'bg-lime-100 text-lime-800 border border-lime-300'
        }`}>
          {status.msg}
        </div>
      )}

      {/* User list */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-2 text-gray-600 font-medium">Username</th>
              <th className="text-left px-4 py-2 text-gray-600 font-medium">Role</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No users</td></tr>
            ) : users.map(u => (
              <tr key={u.username} className="border-t border-gray-100">
                <td className="px-4 py-2 text-gray-800">
                  {u.username}
                  {u.username === currentUsername && (
                    <span className="ml-2 text-xs text-lime-600 font-medium">(you)</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    onClick={() => handleDelete(u.username)}
                    disabled={!canDelete(u)}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title={
                      u.username === currentUsername ? 'Cannot delete your own account'
                      : users.length <= 1 ? 'Cannot delete the last user'
                      : !canDelete(u) ? 'Insufficient permissions to delete this user'
                      : 'Delete user'
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add user form — only shown if the current role can assign at least one role */}
      {rolesForSelect.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Add New User</h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="3–20 alphanumeric / underscore"
                required
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-lime-500 bg-white"
              >
                {rolesForSelect.map(r => (
                  <option key={r.name} value={r.name}>{r.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Create User
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
