'use client';
import {adminText} from '@/lib/admin/translate';


import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {OpsMetrics, OpsEmpty} from './OpsUI';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import TableDataBar from '@/components/admin/ui/TableDataBar';

const EMPTY = {
  nameEn: '',
  nameAr: '',
  slug: '',
  descriptionEn: '',
  descriptionAr: '',
  headEmployeeId: '',
  order: 99,
  active: true,
};

export default function DepartmentsManager({
  initialDepartments = [],
  employees = [],
  canWrite = false,
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialDepartments);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function openNew() {
    setError('');
    setDraft({...EMPTY, order: (items.length + 1) * 10});
  }

  function openEdit(dept) {
    setError('');
    setDraft({
      ...EMPTY,
      ...dept,
      headEmployeeId: dept.headEmployeeId || '',
    });
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
        body: JSON.stringify({
          resource: 'departments',
          document: {
            ...draft,
            headEmployeeId: draft.headEmployeeId || null,
            order: Number(draft.order) || 99,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setItems((current) => {
        const next = current.filter((d) => d.id !== data.document.id);
        next.push(data.document);
        return next.sort((a, b) => a.order - b.order);
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
    if (!window.confirm(adminText('Delete this department?'))) return;
    const res = await fetch(`/api/admin/ops?resource=departments&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Delete failed');
      return;
    }
    setItems((current) => current.filter((d) => d.id !== id));
    router.refresh();
  }

  const empName = Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn]));
  const visible = items.filter((d) => `${d.nameEn} ${d.nameAr}`.toLowerCase().includes(query.toLowerCase()));
  const tableColumns = [
    {key:'order',label:'Order'},
    {key:'nameEn',label:'Department'},
    {key:'nameAr',label:'Name AR'},
    {key:'slug',label:'Slug'},
    {key:'headEmployeeId',label:'Head'},
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
          body: JSON.stringify({
            resource: 'departments',
            document: {...EMPTY, ...row, id: undefined, order: Number(row.order) || 99, headEmployeeId: row.headEmployeeId || null},
          }),
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

  return (
    <div className="adm-stack">
      <OpsMetrics items={[{label:'Departments',value:items.length,hint:'Organizational units'},{label:'Active units',value:items.filter(d=>d.active).length,hint:'Current organization',tone:'good'},{label:'Leadership assigned',value:items.filter(d=>d.headEmployeeId).length,hint:'Departments with a named head'},{label:'Without leadership',value:items.filter(d=>d.active&&!d.headEmployeeId).length,hint:'Active units requiring an owner',tone:'warning'}]}/>
      <TableDataBar
        query={query}
        onQuery={setQuery}
        searchPlaceholder="Search departments…"
        columns={tableColumns}
        rows={visible}
        filename="departments"
        title="Departments"
        canImport={canWrite}
        onImport={importExcel}
        extra={canWrite ? <button type="button" className="adm-btn" onClick={openNew}>{adminText("Add department")}</button> : null}
      />
      {error && !draft ? <p className="adm-error">{adminText(error)}</p> : null}

      <div className="adm-card" style={{padding: 0, overflow: 'auto'}}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>{adminText("Order")}</th>
              <th>{adminText("Department")}</th>
              <th>{adminText("Head")}</th>
              <th>{adminText("Team size")}</th>
              <th>{adminText("Status")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((dept) => (
              <tr key={dept.id}>
                <td>{adminText(dept.order)}</td>
                <td>
                  <strong>{dept.nameEn}</strong>
                  <div style={{fontSize: 12, color: 'var(--cms-muted)'}} dir="rtl">
                    {dept.nameAr || '—'}
                  </div>
                </td>
                <td>{adminText(empName[dept.headEmployeeId] || '—')}</td>
                <td>{adminText(employees.filter(e=>e.departmentId===dept.id).length)}{adminText(" members")}</td><td><span className={`ops-pill ${dept.active?'good':''}`}>{adminText(dept.active ? 'Active' : 'Inactive')}</span></td>
                <td style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                  <button type="button" className="adm-btn-ghost" onClick={() => openEdit(dept)}>
                    {adminText(canWrite ? 'Edit' : 'View')}
                  </button>
                  {canWrite ? (
                    <button type="button" className="adm-btn-ghost" onClick={() => onDelete(dept.id)}>{adminText("Delete")}</button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!items.some(d=>`${d.nameEn} ${d.nameAr}`.toLowerCase().includes(query.toLowerCase()))&&<tr><td colSpan={6}><OpsEmpty/></td></tr>}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText(draft.id ? 'Edit department' : 'Add department')}</h2>
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
                    <label>{adminText("Slug")}</label>
                    <input
                      value={draft.slug}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, slug: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Order")}</label>
                    <input
                      type="number"
                      value={draft.order}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, order: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Department head")}</label>
                    <select
                      value={draft.headEmployeeId}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, headEmployeeId: e.target.value})}
                    >
                      <option value="">—</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.fullNameEn}
                        </option>
                      ))}
                    </select>
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
                  <label>{adminText("Description (EN)")}</label>
                  <textarea
                    rows={3}
                    value={draft.descriptionEn}
                    disabled={!canWrite}
                    onChange={(e) => setDraft({...draft, descriptionEn: e.target.value})}
                  />
                </div>
              </div>
              {canWrite ? (
                <div className="adm-modal-foot">
                  <button type="submit" className="adm-btn" disabled={saving}>
                    {adminText(saving ? 'Saving…' : 'Save department')}
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
