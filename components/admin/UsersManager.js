'use client';
import {adminText} from '@/lib/admin/translate';


import Link from 'next/link';
import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {ROLE_LABELS, ROLES} from '@/lib/cms/permissions';
import {formatAdminDateTime} from '@/lib/admin/locale';
import TableDataBar from '@/components/admin/ui/TableDataBar';

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

  const [roleFilter, setRoleFilter] = useState('all');
  const [query, setQuery] = useState('');

  const roleOptions = useMemo(
    () => ROLE_OPTIONS.map((role) => ({value: role, label: ROLE_LABELS[role]})),
    [],
  );

  const roleCounts = useMemo(() => {
    const counts = {all: users.length};
    for (const role of ROLE_OPTIONS) {
      counts[role] = users.filter((user) => user.role === role).length;
    }
    return counts;
  }, [users]);

  const visibleUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (!q) return true;
      return [user.name, user.email, user.role].join(' ').toLowerCase().includes(q);
    });
  }, [users, roleFilter, query]);

  const tableColumns = [
    {key:'name',label:'Name'},
    {key:'email',label:'Email'},
    {key:'role',label:'Role'},
    {key:'status',label:'Status'},
    {key:'password',label:'Password'},
  ];

  async function importExcel(mapped) {
    if (!canWrite) return;
    setSaving(true);
    setError('');
    try {
      for (const row of mapped) {
        if (!row.email || !row.password) throw new Error('Each imported user needs email and password columns.');
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email: row.email, name: row.name || row.email, role: row.role || ROLES.EDITOR, password: row.password}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Import failed');
      }
      await refresh();
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setSaving(false);
    }
  }

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
    if (!window.confirm(adminText('Delete this user?'))) return;
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
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      {canWrite ? (
        <form className="adm-card" onSubmit={onCreate}>
          <h2 className="adm-section-title" style={{marginTop: 0}}>{adminText("Invite user")}</h2>
          <div className="adm-grid-2">
            <div className="adm-field">
              <label htmlFor="user-name">{adminText("Name")}</label>
              <input
                id="user-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({...prev, name: e.target.value}))}
                required
              />
            </div>
            <div className="adm-field">
              <label htmlFor="user-email">{adminText("Email")}</label>
              <input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({...prev, email: e.target.value}))}
                required
              />
            </div>
            <div className="adm-field">
              <label htmlFor="user-role">{adminText("Role")}</label>
              <select
                id="user-role"
                value={form.role}
                onChange={(e) => setForm((prev) => ({...prev, role: e.target.value}))}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {adminText(option.label)}
                  </option>
                ))}
              </select>
            </div>
            <div className="adm-field">
              <label htmlFor="user-password">{adminText("Temporary password")}</label>
              <input
                id="user-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({...prev, password: e.target.value}))}
                required
                minLength={10}
              />
            </div>
          </div>
          <button className="adm-btn" type="submit" disabled={saving}>
            {adminText(saving ? 'Creating…' : 'Create user')}
          </button>
        </form>
      ) : null}

      <div className="adm-card">
        <TableDataBar
          query={query}
          onQuery={setQuery}
          searchPlaceholder="Search users…"
          filter={roleFilter === 'all' ? '' : roleFilter}
          onFilter={(value) => setRoleFilter(value || 'all')}
          filterLabel="All roles"
          filterOptions={roleOptions}
          columns={tableColumns}
          rows={visibleUsers}
          filename="users"
          title="Users"
          canImport={canWrite}
          onImport={importExcel}
        />
        <div className="adm-tabs" style={{marginBottom: 16, flexWrap: 'wrap'}}>
          <button
            type="button"
            className={`adm-tab${roleFilter === 'all' ? ' is-active' : ''}`}
            onClick={() => setRoleFilter('all')}
          >
            {adminText('All')} ({roleCounts.all})
          </button>
          {roleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`adm-tab${roleFilter === option.value ? ' is-active' : ''}`}
              onClick={() => setRoleFilter(option.value)}
            >
              {adminText(option.label)} ({roleCounts[option.value] || 0})
            </button>
          ))}
        </div>
        <table className="adm-table">
          <thead>
            <tr>
              <th>{adminText("Name")}</th>
              <th>{adminText("Email")}</th>
              <th>{adminText("Role")}</th>
              <th>{adminText("Status")}</th>
              <th>{adminText("Last login")}</th>
              {canWrite ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={canWrite ? 6 : 5}>{adminText('No users in this role.')}</td>
              </tr>
            ) : null}
            {visibleUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <Link href={`/admin/users/${user.id}`} style={{fontWeight: 650, color: 'inherit'}}>
                    {user.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.photoUrl} alt="" style={{width: 28, height: 28, borderRadius: 8, objectFit: 'cover', marginInlineEnd: 8, verticalAlign: 'middle'}} />
                    ) : null}
                    {user.name}
                  </Link>
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
                          {adminText(option.label)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    ROLE_LABELS[user.role] || user.role
                  )}
                </td>
                <td>
                  <span className={`adm-badge ${user.active ? 'published' : 'draft'}`}>
                    {adminText(user.active ? 'Active' : 'Disabled')}
                  </span>
                </td>
                <td className="adm-nowrap">{user.lastLoginAt ? formatAdminDateTime(user.lastLoginAt) : '—'}</td>
                {canWrite ? (
                  <td>
                    <div className="adm-actions">
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() => patchUser(user.id, {active: !user.active})}
                      >
                        {adminText(user.active ? 'Disable' : 'Enable')}
                      </button>
                      <button
                        type="button"
                        className="adm-btn-danger"
                        onClick={() => removeUser(user.id)}
                      >{adminText("Delete")}</button>
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
