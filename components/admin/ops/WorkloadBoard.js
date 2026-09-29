'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/admin/ui/StatusBadge';

export default function WorkloadBoard({initialBoard = null, departments = []}) {
  const [departmentId, setDepartmentId] = useState('');
  const [board, setBoard] = useState(initialBoard);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const rows = board?.rows || [];
  const summary = board?.summary || {};

  const filtered = useMemo(() => {
    if (!departmentId) return rows;
    return rows.filter((r) => r.employee?.departmentId === departmentId);
  }, [rows, departmentId]);

  async function reload(dept = departmentId) {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({resource: 'workload'});
      if (dept) qs.set('departmentId', dept);
      const res = await fetch(`/api/admin/ops?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setBoard(data);
    } catch (err) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="adm-stack">
      <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end'}}>
        <div className="adm-field" style={{margin: 0, minWidth: 220}}>
          <label>{adminText("Department")}</label>
          <select
            value={departmentId}
            onChange={async (e) => {
              setDepartmentId(e.target.value);
              await reload(e.target.value);
            }}
          >
            <option value="">{adminText("All departments")}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameEn}
              </option>
            ))}
          </select>
        </div>
        <button type="button" className="adm-btn-ghost" onClick={() => reload()} disabled={loading}>
          {adminText(loading ? 'Refreshing…' : 'Refresh')}
        </button>
      </div>

      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      <div className="adm-grid-3">
        <div className="adm-card">
          <p className="adm-section-help" style={{marginTop: 0}}>{adminText("People")}</p>
          <strong style={{fontSize: 28}}>{adminText(summary.people || 0)}</strong>
        </div>
        <div className="adm-card">
          <p className="adm-section-help" style={{marginTop: 0}}>{adminText("Overallocated (>100%)")}</p>
          <strong style={{fontSize: 28}}>{adminText(summary.overallocated || 0)}</strong>
        </div>
        <div className="adm-card">
          <p className="adm-section-help" style={{marginTop: 0}}>{adminText("On leave / overdue tasks")}</p>
          <strong style={{fontSize: 22}}>
            {adminText(summary.onLeave || 0)} / {adminText(summary.withOverdue || 0)}
          </strong>
        </div>
      </div>

      <div className="adm-card" style={{padding: 0, overflow: 'auto'}}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>{adminText("Employee")}</th>
              <th>{adminText("Department")}</th>
              <th>{adminText("Assigned %")}</th>
              <th>{adminText("Projects")}</th>
              <th>{adminText("Open / overdue")}</th>
              <th>{adminText("Capacity")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.employee.id}>
                <td>
                  <strong>{row.employee.fullNameEn}</strong>
                  <div style={{fontSize: 12, color: 'var(--cms-muted)'}}>
                    {adminText(row.employee.jobTitleEn || '—')}
                    {adminText(row.onLeaveNow ? ' · on leave' : '')}
                  </div>
                </td>
                <td>{adminText(row.department?.nameEn || '—')}</td>
                <td>
                  <strong>{adminText(row.assignedWorkload)}%</strong>
                  <div className="ops-progress" style={{marginTop: 6}}>
                    <span style={{width: `${Math.min(row.assignedWorkload, 100)}%`}} />
                  </div>
                </td>
                <td>
                  {row.assignments.length ? (
                    <ul className="ops-360-list" style={{margin: 0}}>
                      {row.assignments.slice(0, 3).map((a) => (
                        <li key={a.id}>
                          {a.project ? (
                            <Link href={`/admin/ops/projects/${a.project.id}`}>
                              {adminText(a.project.code)}
                            </Link>
                          ) : (
                            '—'
                          )}{adminText(' ')}
                          ({adminText(a.workloadPercent || 0)}%)
                        </li>
                      ))}
                      {row.assignments.length > 3 ? (
                        <li>+{adminText(row.assignments.length - 3)}{adminText(" more")}</li>
                      ) : null}
                    </ul>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {adminText(row.openTasks)} / {adminText(row.overdueTasks)}
                </td>
                <td>
                  <StatusBadge status={row.capacityLabel}>
                    {adminText(row.capacityLabel)}
                  </StatusBadge>
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={6} style={{padding: 24, color: 'var(--cms-muted)'}}>{adminText("No employees in this view.")}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
