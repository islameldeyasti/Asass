'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {OpsMetrics, OpsAvatar} from './OpsUI';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import TableDataBar from '@/components/admin/ui/TableDataBar';

const EMPTY = {
  nameEn: '',
  nameAr: '',
  code: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  country: 'UAE',
  notes: '',
  active: true,
};

export default function ClientsManager({initialClients = [], projects = [], canWrite = false}) {
  const router = useRouter();
  const [items, setItems] = useState(initialClients);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) =>
      [c.nameEn, c.nameAr, c.code, c.email, c.contactName].join(' ').toLowerCase().includes(q),
    );
  }, [items, query]);

  const tableColumns = [
    {key:'nameEn',label:'Client'},
    {key:'code',label:'Code'},
    {key:'contactName',label:'Contact'},
    {key:'email',label:'Email'},
    {key:'phone',label:'Phone'},
    {key:'country',label:'Location'},
  ];

  async function importExcel(mapped) {
    if (!canWrite) return;
    setSaving(true);
    setError('');
    try {
      for (const row of mapped) {
        const res = await fetch('/api/admin/ops', {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({resource: 'clients', document: {...EMPTY, ...row, id: undefined}}),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Import failed');
      }
      router.refresh();
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setSaving(false);
    }
  }

  async function onSave(event) {
    event.preventDefault();
    if (!canWrite || !draft) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({resource: 'clients', document: draft}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setItems((current) => {
        const next = current.filter((c) => c.id !== data.document.id);
        next.push(data.document);
        return next.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
      });
      setDraft(null);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!canWrite) return;
    if (!window.confirm(adminText('Delete this client?'))) return;
    const res = await fetch(`/api/admin/ops?resource=clients&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Delete failed');
      return;
    }
    setItems((current) => current.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <div className="adm-stack">
      <OpsMetrics items={[{label:'Client accounts',value:items.length,hint:'Delivery relationships'},{label:'Active accounts',value:items.filter(c=>c.active).length,hint:'Current client base',tone:'good'},{label:'With projects',value:new Set(projects.map(p=>p.clientId).filter(Boolean)).size,hint:'Connected to project delivery'},{label:'Contact coverage',value:`${items.length?Math.round(items.filter(c=>c.email||c.phone).length/items.length*100):0}%`,hint:'Accounts with email or phone'}]}/>
      <TableDataBar
        query={query}
        onQuery={setQuery}
        searchPlaceholder="Search clients…"
        columns={tableColumns}
        rows={filtered}
        filename="clients"
        title="Clients"
        canImport={canWrite}
        onImport={importExcel}
        extra={canWrite ? <button type="button" className="adm-btn" onClick={() => setDraft({...EMPTY})}>{adminText("Add client")}</button> : null}
      />
      {error && !draft ? <p className="adm-error">{adminText(error)}</p> : null}

      <div className="adm-card" style={{padding: 0, overflow: 'auto'}}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>{adminText("Client")}</th>
              <th>{adminText("Contact")}</th>
              <th>{adminText("Projects")}</th>
              <th>{adminText("Location")}</th>
              <th>{adminText("Status")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id}>
                <td>
                  <div className="ops-person"><OpsAvatar name={client.nameEn}/><strong>{client.nameEn}</strong></div>
                  <div style={{fontSize: 12, color: 'var(--cms-muted)'}}>
                    {client.code || client.nameAr || '—'}
                  </div>
                </td>
                <td>
                  {adminText(client.contactName || '—')}
                  <div style={{fontSize: 12, color: 'var(--cms-muted)'}}>{client.email || client.phone}</div>
                </td>
                <td>{projects.filter(p=>p.clientId===client.id).map(p=><Link key={p.id} href={`/admin/ops/projects/${p.id}`} style={{display:'block',fontSize:11,marginBottom:5}}>{p.nameEn}</Link>)}{adminText(!projects.some(p=>p.clientId===client.id)&&'—')}</td><td>{adminText(client.country || '—')}</td>
                <td><span className={`ops-pill ${client.active?'good':''}`}>{adminText(client.active ? 'Active' : 'Inactive')}</span></td>
                <td style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                  <button type="button" className="adm-btn-ghost" onClick={() => setDraft({...EMPTY, ...client})}>
                    {adminText(canWrite ? 'Edit' : 'View')}
                  </button>
                  {canWrite ? (
                    <button type="button" className="adm-btn-ghost" onClick={() => onDelete(client.id)}>{adminText("Delete")}</button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={6} style={{padding: 24, color: 'var(--cms-muted)'}}>{adminText("No operations clients yet. These are delivery clients — separate from website logo clients.")}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText(draft.id ? 'Edit client' : 'Add client')}</h2>
              <AdminCloseButton onClick={() => setDraft(null)} disabled={saving} />
            </div>
            <form onSubmit={onSave}>
              <div className="adm-modal-body">
                {error ? <p className="adm-error">{adminText(error)}</p> : null}
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <label>{adminText("Name (EN)")}</label>
                    <input
                      required
                      value={draft.nameEn}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, nameEn: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Name (AR)")}</label>
                    <input
                      dir="rtl"
                      value={draft.nameAr}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, nameAr: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Client code")}</label>
                    <input
                      value={draft.code}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, code: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Contact name")}</label>
                    <input
                      value={draft.contactName}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, contactName: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Email")}</label>
                    <input
                      type="email"
                      value={draft.email}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, email: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Phone")}</label>
                    <input
                      value={draft.phone}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, phone: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Country")}</label>
                    <input
                      value={draft.country}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, country: e.target.value})}
                    />
                  </div>
                  <label className="adm-check" style={{alignSelf: 'end'}}>
                    <input
                      type="checkbox"
                      checked={draft.active !== false}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, active: e.target.checked})}
                    />{adminText("Active")}</label>
                </div>
                <div className="adm-field">
                  <label>{adminText("Address")}</label>
                  <textarea
                    rows={2}
                    value={draft.address}
                    disabled={!canWrite}
                    onChange={(e) => setDraft({...draft, address: e.target.value})}
                  />
                </div>
                <div className="adm-field">
                  <label>{adminText("Notes")}</label>
                  <textarea
                    rows={3}
                    value={draft.notes}
                    disabled={!canWrite}
                    onChange={(e) => setDraft({...draft, notes: e.target.value})}
                  />
                </div>
              </div>
              {canWrite ? (
                <div className="adm-modal-foot">
                  <button type="submit" className="adm-btn" disabled={saving}>
                    {adminText(saving ? 'Saving…' : 'Save client')}
                  </button>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
