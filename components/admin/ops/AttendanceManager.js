'use client';
import {adminText} from '@/lib/admin/translate';


import {useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {ATTENDANCE_TYPES} from '@/lib/ops/constants';

const EMPTY = {
  employeeId: '',
  date: '',
  type: 'present',
  checkIn: '',
  checkOut: '',
  projectId: '',
  notes: '',
};

export default function AttendanceManager({
  initialItems = [],
  initialSummary = null,
  employees = [],
  projects = [],
  canWrite = false,
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [summary, setSummary] = useState(initialSummary);
  const [draft, setDraft] = useState(null);
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(initialItems);
    setSummary(initialSummary);
  }, [initialItems, initialSummary]);

  const empMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn])),
    [employees],
  );
  const projectMap = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p.code || p.nameEn])),
    [projects],
  );

  async function refresh(date = dateFilter) {
    const qs = new URLSearchParams({resource: 'attendance'});
    if (date) qs.set('date', date);
    const res = await fetch(`/api/admin/ops?${qs.toString()}`);
    const body = await res.json();
    if (res.ok) {
      setItems(body.items || []);
      setSummary(body.summary || null);
    }
    router.refresh();
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
          resource: 'attendance',
          document: {
            ...draft,
            projectId: draft.projectId || null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDraft(null);
      await refresh(draft.date || dateFilter);
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!canWrite) return;
    if (!window.confirm(adminText('Delete this attendance record?'))) return;
    const res = await fetch(
      `/api/admin/ops?resource=attendance&id=${encodeURIComponent(id)}`,
      {method: 'DELETE'},
    );
    const body = await res.json();
    if (!res.ok) {
      setError(body.error || 'Delete failed');
      return;
    }
    await refresh();
  }

  return (
    <div className="adm-stack">
      <div style={{display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'}}>
        <div className="adm-field" style={{margin: 0, minWidth: 200}}>
          <label>{adminText("Date")}</label>
          <input
            type="date"
            value={dateFilter}
            onChange={async (e) => {
              setDateFilter(e.target.value);
              await refresh(e.target.value);
            }}
          />
        </div>
        {canWrite ? (
          <button
            type="button"
            className="adm-btn"
            onClick={() => setDraft({...EMPTY, date: dateFilter})}
          >{adminText("Record attendance")}</button>
        ) : null}
      </div>

      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      {summary ? (
        <div className="adm-grid-3">
          <div className="adm-card">
            <p className="adm-section-help" style={{marginTop: 0}}>{adminText("Records")}</p>
            <strong style={{fontSize: 28}}>{adminText(summary.total || 0)}</strong>
          </div>
          <div className="adm-card">
            <p className="adm-section-help" style={{marginTop: 0}}>{adminText("Present / remote / site")}</p>
            <strong style={{fontSize: 22}}>
              {adminText((summary.byType?.present || 0) + (summary.byType?.remote || 0) + (summary.byType?.site || 0))}
            </strong>
          </div>
          <div className="adm-card">
            <p className="adm-section-help" style={{marginTop: 0}}>{adminText("Absent / leave")}</p>
            <strong style={{fontSize: 22}}>
              {adminText((summary.byType?.absent || 0) + (summary.byType?.leave || 0))}
            </strong>
          </div>
        </div>
      ) : null}

      <div className="adm-card" style={{padding: 0, overflow: 'auto'}}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>{adminText("Employee")}</th>
              <th>{adminText("Type")}</th>
              <th>{adminText("In / Out")}</th>
              <th>{adminText("Project")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id}>
                <td>{adminText(empMap[row.employeeId] || '—')}</td>
                <td>
                  <StatusBadge status={row.type}>
                    {ATTENDANCE_TYPES.find((t) => t.value === row.type)?.label || row.type}
                  </StatusBadge>
                </td>
                <td>
                  {adminText(row.checkIn || '—')} / {adminText(row.checkOut || '—')}
                </td>
                <td>{adminText(row.projectId ? projectMap[row.projectId] || row.projectId : '—')}</td>
                <td style={{textAlign: 'right'}}>
                  {canWrite ? (
                    <>
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() =>
                          setDraft({
                            ...EMPTY,
                            ...row,
                            employeeId: row.employeeId || '',
                            projectId: row.projectId || '',
                          })
                        }
                      >{adminText("Edit")}</button>
                      <button type="button" className="adm-btn-ghost" onClick={() => onDelete(row.id)}>{adminText("Delete")}</button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td colSpan={5} style={{padding: 24, color: 'var(--cms-muted)'}}>{adminText("No attendance for this date.")}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText(draft.id ? 'Edit attendance' : 'Record attendance')}</h2>
              <AdminCloseButton onClick={() => setDraft(null)} disabled={saving} />
            </div>
            <form onSubmit={onSave}>
              <div className="adm-modal-body">
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <label>{adminText("Employee")}</label>
                    <select
                      required
                      value={draft.employeeId}
                      onChange={(e) => setDraft({...draft, employeeId: e.target.value})}
                    >
                      <option value="">—</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.fullNameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Date")}</label>
                    <input
                      type="date"
                      required
                      value={draft.date}
                      onChange={(e) => setDraft({...draft, date: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Type")}</label>
                    <select
                      value={draft.type}
                      onChange={(e) => setDraft({...draft, type: e.target.value})}
                    >
                      {ATTENDANCE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {adminText(t.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Project (optional)")}</label>
                    <select
                      value={draft.projectId}
                      onChange={(e) => setDraft({...draft, projectId: e.target.value})}
                    >
                      <option value="">—</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {adminText(p.code)} · {p.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Check-in")}</label>
                    <input
                      value={draft.checkIn}
                      placeholder={adminText("09:00")}
                      onChange={(e) => setDraft({...draft, checkIn: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Check-out")}</label>
                    <input
                      value={draft.checkOut}
                      placeholder={adminText("18:00")}
                      onChange={(e) => setDraft({...draft, checkOut: e.target.value})}
                    />
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Notes")}</label>
                  <textarea
                    rows={2}
                    value={draft.notes}
                    onChange={(e) => setDraft({...draft, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="adm-modal-foot">
                <button type="submit" className="adm-btn" disabled={saving}>
                  {adminText(saving ? 'Saving…' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
