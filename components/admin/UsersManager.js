'use client';

import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {ROLE_LABELS, ROLES} from '@/lib/cms/permissions';

const ROLE_OPTIONS = Object.values(ROLES);

export default function UsersManager({initialUsers, canWrite}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: '',
    name: '',
    role: ROLES.EDITOR,
    password: '',
  });

  const roleOptions = useMemo(
    () => ROLE_OPTIONS.map((role) => ({value: role, label: ROLE_LABELS[role]})),
    [],
  );

  async function refresh() {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if (res.ok) setUsers(data.users || []);
    router.refresh();
  }

  async function onCreate(event) {
    event.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create user');
      setForm({email: '', name: '', role: ROLES.EDITOR, password: ''});
      await refresh();
    } catch (err) {
      setError(err.message || 'Could not create user');
    } finally {
      setSaving(false);
    }
  }

  async function patchUser(id, patch) {
    if (!canWrite) return;
    setError('');
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id, ...patch}),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Update failed');
      return;
    }
    await refresh();
  }

  async function removeUser(id) {
    if (!canWrite) return;
    if (!window.confirm('Delete this user?')) return;
    setError('');
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id}),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Delete failed');
      return;
    }
    await refresh();
  }

  return (
    <div className="adm-stack">
      {error ? <p className="adm-error">{error}</p> : null}

      {canWrite ? (
        <form className="adm-card" onSubmit={onCreate}>
          <h2 className="adm-section-title" style={{marginTop: 0}}>
            Invite user
          </h2>
          <div className="adm-grid-2">
            <div className="adm-field">
              <label htmlFor="user-name">Name</label>
              <input
                id="user-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({...prev, name: e.target.value}))}
                required
              />
            </div>
            <div className="adm-field">
              <label htmlFor="user-email">Email</label>
              <input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({...prev, email: e.target.value}))}
                required
              />
            </div>
            <div className="adm-field">
              <label htmlFor="user-role">Role</label>
              <select
                id="user-role"
                value={form.role}
                onChange={(e) => setForm((prev) => ({...prev, role: e.target.value}))}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="adm-field">
              <label htmlFor="user-password">Temporary password</label>
              <input
                id="user-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({...prev, password: e.target.value}))}
                required
                minLength={6}
              />
            </div>
          </div>
          <button className="adm-btn" type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create user'}
          </button>
        </form>
      ) : null}

      <div className="adm-card">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last login</th>
              {canWrite ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <strong>{user.name}</strong>
                </td>
                <td>{user.email}</td>
                <td>
                  {canWrite ? (
                    <select
                      value={user.role}
                      onChange={(e) => patchUser(user.id, {role: e.target.value})}
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    ROLE_LABELS[user.role] || user.role
                  )}
                </td>
                <td>
                  <span className={`adm-badge ${user.active ? 'published' : 'draft'}`}>
                    {user.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'}</td>
                {canWrite ? (
                  <td>
                    <div className="adm-actions">
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() => patchUser(user.id, {active: !user.active})}
                      >
                        {user.active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        type="button"
                        className="adm-btn-danger"
                        onClick={() => removeUser(user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
