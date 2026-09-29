'use client';
import {adminText} from '@/lib/admin/translate';


import {useState} from 'react';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {formatAdminDateTime} from '@/lib/admin/locale';
import TableDataBar from '@/components/admin/ui/TableDataBar';

export default function OpsAuditViewer({initialItems = []}) {
  const [items, setItems] = useState(initialItems);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function search(event) {
    event?.preventDefault?.();
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({resource: 'audit', q, limit: '150'});
      const res = await fetch(`/api/admin/ops?${qs.toString()}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Search failed');
      setItems(body.items || []);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="adm-stack">
      <TableDataBar
        query={q}
        onQuery={setQ}
        searchPlaceholder="Search action, actor, entity…"
        columns={[
          {key:'at',label:'When'},
          {key:'actor',label:'Actor'},
          {key:'action',label:'Action'},
          {key:'entity',label:'Entity'},
        ]}
        rows={items}
        filename="ops-audit"
        title="Operations audit"
        extra={
          <button type="button" className="adm-btn" disabled={loading} onClick={() => search()}>
            {adminText(loading ? 'Searching…' : 'Search')}
          </button>
        }
      />
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      <div className="adm-card" style={{padding: 0, overflow: 'auto'}}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>{adminText("When")}</th>
              <th>{adminText("Actor")}</th>
              <th>{adminText("Action")}</th>
              <th>{adminText("Entity")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td style={{whiteSpace: 'nowrap'}}>
                  {row.at ? formatAdminDateTime(row.at) : '—'}
                </td>
                <td>{adminText(row.actorEmail || row.actorId || '—')}</td>
                <td>
                  <StatusBadge status="info">{adminText(row.action)}</StatusBadge>
                </td>
                <td>
                  {adminText(row.entity || '—')}
                  {row.entityId ? (
                    <div style={{fontSize: 12, color: 'var(--cms-muted)'}}>{adminText(row.entityId)}</div>
                  ) : null}
                </td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td colSpan={4} style={{padding: 24, color: 'var(--cms-muted)'}}>{adminText("No matching ops audit entries.")}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
