'use client';
import {adminText} from '@/lib/admin/translate';


import {useEffect, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {LEAVE_STATUSES, LEAVE_TYPES} from '@/lib/ops/constants';
import TableDataBar from '@/components/admin/ui/TableDataBar';

const EMPTY = {
  employeeId: '',
  leaveType: 'annual',
  startDate: '',
  endDate: '',
  reason: '',
};

export default function LeaveManager({
  initialItems = [],
  initialBalances = {},
  employees = [],
  meEmployeeId = null,
  isHr = false,
  canDecide = false,
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [balances, setBalances] = useState(initialBalances);
  const [draft, setDraft] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(initialItems);
    setBalances(initialBalances);
  }, [initialItems, initialBalances]);

  const empMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn])),
    [employees],
  );

  const visible = useMemo(() => {
    if (!statusFilter) return items;
    return items.filter((r) => r.status === statusFilter);
  }, [items, statusFilter]);

  async function refresh() {
    const res = await fetch('/api/admin/ops?resource=leave-requests');
    const body = await res.json();
    if (res.ok) {
      setItems(body.items || []);
      setBalances(body.balances || {});
    }
    router.refresh();
  }

  async function onSave(event) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          resource: 'leave-requests',
          document: {
            ...draft,
            employeeId: isHr ? draft.employeeId || meEmployeeId : meEmployeeId,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDraft(null);
      await refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function decide(id, status) {
    if (!canDecide) return;
    const decisionNote =
      window.prompt(status === 'approved' ? 'Note (optional)' : 'Rejection reason') || '';
    if (status === 'rejected' && !decisionNote.trim()) return;
    setError('');
    const res = await fetch('/api/admin/ops', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        resource: 'leave-decide',
        document: {id, status, decisionNote},
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Decision failed');
      return;
    }
    await refresh();
  }

  async function cancelOwn(id) {
    setError('');
    if (canDecide) {
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          resource: 'leave-decide',
          document: {id, status: 'cancelled', decisionNote: 'Cancelled'},
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Cancel failed');
        return;
      }
      await refresh();
      return;
    }
    const save = await fetch('/api/admin/ops', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        resource: 'leave-requests',
        document: {id, status: 'cancelled'},
      }),
    });
    const body = await save.json();
    if (!save.ok) {
      setError(body.error || 'Cancel failed');
      return;
    }
    await refresh();
  }

  const balanceRows = Object.values(balances || {}).filter((b) => b.allowance > 0 || b.used > 0 || b.pending > 0);

  return (
    <div className="adm-stack">
      <div style={{display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'}}>
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
          <button type="button" className={!statusFilter ? 'adm-btn' : 'adm-btn-ghost'} onClick={() => setStatusFilter('')}>{adminText("All")}</button>
          {LEAVE_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              className={statusFilter === s.value ? 'adm-btn' : 'adm-btn-ghost'}
              onClick={() => setStatusFilter(s.value)}
            >
              {adminText(s.label)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="adm-btn"
          onClick={() =>
            setDraft({
              ...EMPTY,
              employeeId: isHr ? '' : meEmployeeId || '',
            })
          }
          disabled={!isHr && !meEmployeeId}
        >{adminText("Request leave")}</button>
      </div>
      <TableDataBar
        filter={statusFilter}
        onFilter={setStatusFilter}
        filterLabel="All statuses"
        filterOptions={LEAVE_STATUSES}
        columns={[
          {key:'employeeId',label:'Employee'},
          {key:'leaveType',label:'Type'},
          {key:'startDate',label:'Start'},
          {key:'endDate',label:'End'},
          {key:'status',label:'Status'},
        ]}
        rows={visible.map((row) => ({...row, employeeId: empMap[row.employeeId] || row.employeeId}))}
        filename="leave"
        title="Leave"
      />

      {!isHr && !meEmployeeId ? (
        <p className="adm-error">{adminText("Link your CMS user to an employee profile (Employees → Edit → CMS user) to request leave.")}</p>
      ) : null}
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      {balanceRows.length ? (
        <div className="adm-grid-3">
          {balanceRows.map((b) => (
            <div key={b.label} className="adm-card">
              <p className="adm-section-help" style={{marginTop: 0}}>
                {adminText(b.label)}
              </p>
              <strong style={{fontSize: 22}}>{adminText(b.remaining)}</strong>
              <p style={{margin: '6px 0 0', color: 'var(--cms-muted)', fontSize: 13}}>{adminText("remaining · ")}{adminText(b.used)}{adminText(" used · ")}{adminText(b.pending)}{adminText(" pending")}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="adm-card" style={{padding: 0, overflow: 'auto'}}>
        <table className="adm-table">
          <thead>
            <tr>
              {isHr ? <th>{adminText("Employee")}</th> : null}
              <th>{adminText("Type")}</th>
              <th>{adminText("Dates")}</th>
              <th>{adminText("Days")}</th>
              <th>{adminText("Status")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                {isHr ? <td>{adminText(empMap[row.employeeId] || '—')}</td> : null}
                <td>{LEAVE_TYPES.find((t) => t.value === row.leaveType)?.label || row.leaveType}</td>
                <td>
                  {adminText(row.startDate || '—')} → {adminText(row.endDate || '—')}
                </td>
                <td>{adminText(row.days)}</td>
                <td>
                  <StatusBadge status={row.status}>
                    {LEAVE_STATUSES.find((s) => s.value === row.status)?.label || row.status}
                  </StatusBadge>
                  {row.decisionNote ? (
                    <div style={{fontSize: 12, color: 'var(--cms-muted)'}}>{adminText(row.decisionNote)}</div>
                  ) : null}
                </td>
                <td style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                  {canDecide && row.status === 'pending' ? (
                    <>
                      <button type="button" className="adm-btn-ghost" onClick={() => decide(row.id, 'approved')}>{adminText("Approve")}</button>
                      <button type="button" className="adm-btn-ghost" onClick={() => decide(row.id, 'rejected')}>{adminText("Reject")}</button>
                    </>
                  ) : null}
                  {row.status === 'pending' && (canDecide || row.employeeId === meEmployeeId) ? (
                    <button type="button" className="adm-btn-ghost" onClick={() => cancelOwn(row.id)}>{adminText("Cancel")}</button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!visible.length ? (
              <tr>
                <td colSpan={isHr ? 6 : 5} style={{padding: 24, color: 'var(--cms-muted)'}}>{adminText("No leave requests in this filter.")}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText("Request leave")}</h2>
              <AdminCloseButton onClick={() => setDraft(null)} disabled={saving} />
            </div>
            <form onSubmit={onSave}>
              <div className="adm-modal-body">
                {isHr ? (
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
                ) : null}
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <label>{adminText("Leave type")}</label>
                    <select
                      value={draft.leaveType}
                      onChange={(e) => setDraft({...draft, leaveType: e.target.value})}
                    >
                      {LEAVE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {adminText(t.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Start")}</label>
                    <input
                      type="date"
                      required
                      value={draft.startDate}
                      onChange={(e) => setDraft({...draft, startDate: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("End")}</label>
                    <input
                      type="date"
                      required
                      value={draft.endDate}
                      onChange={(e) => setDraft({...draft, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Reason")}</label>
                  <textarea
                    rows={3}
                    value={draft.reason}
                    onChange={(e) => setDraft({...draft, reason: e.target.value})}
                  />
                </div>
              </div>
              <div className="adm-modal-foot">
                <button type="submit" className="adm-btn" disabled={saving}>
                  {adminText(saving ? 'Submitting…' : 'Submit request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
