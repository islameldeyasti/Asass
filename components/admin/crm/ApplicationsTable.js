'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import EmptyState from '@/components/admin/ui/EmptyState';
import {useToast} from '@/components/admin/ui/ToastProvider';
import {formatAdminDateTime} from '@/lib/admin/locale';
import {Briefcase} from 'lucide-react';
import TableDataBar from '@/components/admin/ui/TableDataBar';

export const APPLICATION_STATUSES = [
  'NEW',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'HIRED',
  'REJECTED',
];

function normalizeStatus(value) {
  const next = String(value || 'NEW').toUpperCase();
  return APPLICATION_STATUSES.includes(next) ? next : 'NEW';
}

function formatDate(value) {
  return formatAdminDateTime(value);
}

export default function ApplicationsTable({
  initialItems = [],
  canWrite = false,
}) {
  const {toast} = useToast();
  const [items, setItems] = useState(initialItems);
  const [savingId, setSavingId] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== 'ALL' && normalizeStatus(item.status) !== filter) return false;
      if (!q) return true;
      return [item.name, item.email, item.role, item.jobTitle].join(' ').toLowerCase().includes(q);
    });
  }, [items, filter, query]);

  async function updateStatus(id, status) {
    if (!canWrite) return;
    const previous = items.find((item) => item.id === id);
    setSavingId(id);
    setItems((list) =>
      list.map((item) => (item.id === id ? {...item, status} : item)),
    );
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({resource: 'applications', item: {id, status}}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setItems((list) =>
        list.map((item) => (item.id === data.item.id ? data.item : item)),
      );
      toast({title: 'Application updated', variant: 'success'});
    } catch (err) {
      if (previous) {
        setItems((list) =>
          list.map((item) => (item.id === id ? previous : item)),
        );
      }
      toast({
        title: 'Update failed',
        description: err.message,
        variant: 'error',
      });
    } finally {
      setSavingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={adminText("No applications")}
        description={adminText("Career applications will appear in this pipeline.")}
      />
    );
  }

  return (
    <div className="cms-stack">
      <div className="cms-pipeline" role="tablist" aria-label={adminText("Application status")}>
        <button
          type="button"
          className={filter === 'ALL' ? 'is-active' : ''}
          onClick={() => setFilter('ALL')}
        >{adminText("All (")}{adminText(items.length)})
        </button>
        {APPLICATION_STATUSES.map((status) => {
          const count = items.filter((item) => normalizeStatus(item.status) === status).length;
          return (
            <button
              key={status}
              type="button"
              className={filter === status ? 'is-active' : ''}
              onClick={() => setFilter(status)}
            >
              {adminText(status)} ({adminText(count)})
            </button>
          );
        })}
      </div>

      <TableDataBar
        query={query}
        onQuery={setQuery}
        searchPlaceholder="Search candidates…"
        columns={[
          {key:'name',label:'Candidate'},
          {key:'role',label:'Role'},
          {key:'email',label:'Email'},
          {key:'status',label:'Status'},
          {key:'createdAt',label:'Submitted'},
        ]}
        rows={filtered}
        filename="applications"
        title="Applications"
        canImport={canWrite}
        onImport={async (mapped) => {
          for (const row of mapped) {
            const res = await fetch('/api/admin/content', {
              method: 'PUT',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({resource: 'applications', item: row}),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Import failed');
          }
        }}
      />

      <div className="cms-card" style={{padding: 0, overflow: 'hidden'}}>
        <table className="cms-table">
          <thead>
            <tr>
              <th>{adminText("Candidate")}</th>
              <th>{adminText("Role")}</th>
              <th>{adminText("Email")}</th>
              <th>{adminText("Status")}</th>
              <th>{adminText("Submitted")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => {
              const status = normalizeStatus(item.status);
              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name || item.fullName || '—'}</strong>
                  </td>
                  <td>{adminText(item.role || item.jobTitle || item.position || '—')}</td>
                  <td>{item.email || '—'}</td>
                  <td>
                    {canWrite ? (
                      <select
                        value={status}
                        disabled={savingId === item.id}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                        aria-label={adminText(`Status for ${item.name || item.id}`)}
                      >
                        {APPLICATION_STATUSES.map((option) => (
                          <option key={option} value={option}>
                            {adminText(option)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <StatusBadge status={status.toLowerCase()}>{adminText(status)}</StatusBadge>
                    )}
                  </td>
                  <td>{adminText(formatDate(item.createdAt || item.submittedAt))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
