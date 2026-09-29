'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import {OpsMetrics, OpsAvatar} from './OpsUI';
import TableDataBar from '@/components/admin/ui/TableDataBar';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {EMPLOYEE_STATUSES} from '@/lib/ops/constants';

const EMPTY = {
  fullNameEn: '',
  fullNameAr: '',
  employeeCode: '',
  jobTitleEn: '',
  jobTitleAr: '',
  positionEn: '',
  positionAr: '',
  departmentId: '',
  email: '',
  phone: '',
  whatsapp: '',
  joiningDate: '',
  status: 'active',
  managerId: '',
  cmsUserId: '',
  teamMemberId: '',
  photoUrl: '',
  notes: '',
  skills: '',
  specializations: '',
  certifications: '',
  accountActive: true,
};

function splitList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function statusTone(status) {
  return status || 'draft';
}

export default function EmployeesManager({
  initialEmployees = [],
  departments = [],
  users = [],
  teamMembers = [],
  canWrite = false,
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialEmployees);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const deptMap = useMemo(
    () => Object.fromEntries(departments.map((d) => [d.id, d.nameEn])),
    [departments],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((e) => {
      if (statusFilter && e.status !== statusFilter) return false;
      if (departmentFilter && e.departmentId !== departmentFilter) return false;
      if (!q) return true;
      return [e.fullNameEn, e.fullNameAr, e.email, e.jobTitleEn, e.employeeCode, ...(e.skills || []), ...(e.certifications || [])]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, statusFilter, departmentFilter]);

  const tableColumns = [
    {key:'employeeCode',label:'Employee ID'},
    {key:'fullNameEn',label:'Name'},
    {key:'jobTitleEn',label:'Title'},
    {key:'email',label:'Email'},
    {key:'status',label:'Status'},
    {key:'departmentId',label:'Department'},
    {key:'phone',label:'Phone'},
  ];

  async function importExcel(mapped) {
    if (!canWrite) return;
    setSaving(true);
    setError('');
    try {
      for (const row of mapped) {
        const payload = {
          ...EMPTY,
          ...row,
          id: undefined,
          skills: splitList(row.skills),
          specializations: splitList(row.specializations),
          certifications: splitList(row.certifications),
        };
        const res = await fetch('/api/admin/ops', {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({resource: 'employees', document: payload}),
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

  function openNew() {
    setError('');
    setDraft({...EMPTY});
  }

  function openEdit(emp) {
    setError('');
    setDraft({
      ...EMPTY,
      ...emp,
      departmentId: emp.departmentId || '',
      managerId: emp.managerId || '',
      cmsUserId: emp.cmsUserId || '',
      teamMemberId: emp.teamMemberId || '',
      joiningDate: emp.joiningDate || '',
      skills: (emp.skills || []).join(', '),
      specializations: (emp.specializations || []).join(', '),
      certifications: (emp.certifications || []).join(', '),
    });
  }

  async function onSave(event) {
    event.preventDefault();
    if (!canWrite || !draft) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...draft,
        departmentId: draft.departmentId || null,
        managerId: draft.managerId || null,
        cmsUserId: draft.cmsUserId || null,
        teamMemberId: draft.teamMemberId || null,
        skills: splitList(draft.skills),
        specializations: splitList(draft.specializations),
        certifications: splitList(draft.certifications),
      };
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({resource: 'employees', document: payload}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setItems((current) => {
        const next = current.filter((e) => e.id !== data.document.id);
        next.push(data.document);
        return next.sort((a, b) => a.fullNameEn.localeCompare(b.fullNameEn));
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
    if (!window.confirm(adminText('Delete this employee profile?'))) return;
    const res = await fetch(`/api/admin/ops?resource=employees&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Delete failed');
      return;
    }
    setItems((current) => current.filter((e) => e.id !== id));
    router.refresh();
  }

  return (
    <div className="adm-stack">
      <OpsMetrics items={[{label:'Team members',value:items.length,hint:'Employee directory'},{label:'Active',value:items.filter(e=>e.status==='active').length,hint:'Currently in service',tone:'good'},{label:'Departments represented',value:new Set(items.map(e=>e.departmentId).filter(Boolean)).size,hint:'Across your organization'},{label:'Accounts linked',value:items.filter(e=>e.cmsUserId).length,hint:'Individual access connections'}]}/>
      <div className="adm-toolbar">
        <TableDataBar
          query={query}
          onQuery={(value) => {setQuery(value);setPage(1);}}
          searchPlaceholder="Search names, skills or certifications…"
          filter={statusFilter}
          onFilter={(value) => {setStatusFilter(value);setPage(1);}}
          filterLabel="All statuses"
          filterOptions={EMPLOYEE_STATUSES}
          columns={tableColumns}
          rows={filtered}
          filename="employees"
          title="Employees"
          canImport={canWrite}
          onImport={importExcel}
          extra={
            <>
              <select aria-label={adminText("Filter department")} value={departmentFilter} onChange={(e) => {setDepartmentFilter(e.target.value);setPage(1);}}>
                <option value="">{adminText("All departments")}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.nameEn}</option>
                ))}
              </select>
              {canWrite ? <button type="button" className="adm-btn" onClick={openNew}>{adminText("Add employee")}</button> : null}
            </>
          }
        />
      </div>

      {error && !draft ? <p className="adm-error">{adminText(error)}</p> : null}

      <div className="adm-card" style={{padding: 0, overflow: 'auto'}}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>{adminText("Employee")}</th>
              <th>{adminText("Department")}</th>
              <th>{adminText("Title")}</th>
              <th>{adminText("Status")}</th>
              <th>{adminText("Account")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.slice((Math.min(page,Math.max(1,Math.ceil(filtered.length/12)))-1)*12,Math.min(page,Math.max(1,Math.ceil(filtered.length/12)))*12).map((emp) => (
              <tr key={emp.id}>
                <td>
                  <div className="ops-person"><OpsAvatar name={emp.fullNameEn}/><strong>{emp.fullNameEn}</strong></div>
                  <div style={{fontSize: 12, color: 'var(--cms-muted)'}}>
                    {emp.employeeCode || emp.email || '—'}
                  </div>
                </td>
                <td>{adminText(deptMap[emp.departmentId] || '—')}</td>
                <td>{adminText(emp.jobTitleEn || '—')}</td>
                <td>
                  <StatusBadge status={statusTone(emp.status)}>
                    {EMPLOYEE_STATUSES.find((s) => s.value === emp.status)?.label || emp.status}
                  </StatusBadge>
                </td>
                <td>{adminText(emp.cmsUserId ? 'Linked' : 'No user')}</td>
                <td style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                  <button type="button" className="adm-btn-ghost" onClick={() => openEdit(emp)}>
                    {adminText(canWrite ? 'Edit' : 'View')}
                  </button>
                  {canWrite ? (
                    <button type="button" className="adm-btn-ghost" onClick={() => onDelete(emp.id)}>{adminText("Delete")}</button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={6} style={{padding: 24, color: 'var(--cms-muted)'}}>{adminText("No employees yet. Add staff profiles and link each to their own user account.")}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="ops-results"><span>{adminText(filtered.length)}{adminText(" matching employees")}</span><div className="ops-pagination"><button className="adm-btn-ghost" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>{adminText("Previous")}</button><span>{adminText(Math.min(page,Math.max(1,Math.ceil(filtered.length/12))))} / {adminText(Math.max(1,Math.ceil(filtered.length/12)))}</span><button className="adm-btn-ghost" disabled={page*12>=filtered.length} onClick={()=>setPage(p=>p+1)}>{adminText("Next")}</button></div></div>
      {draft ? (
        <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText(draft.id ? 'Edit employee' : 'Add employee')}</h2>
              <AdminCloseButton onClick={() => setDraft(null)} disabled={saving} />
            </div>
            <form onSubmit={onSave}>
              <div className="adm-modal-body">
                {error ? <p className="adm-error">{adminText(error)}</p> : null}
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <label>{adminText("Full name (EN)")}</label>
                    <input
                      required
                      value={draft.fullNameEn}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, fullNameEn: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Full name (AR)")}</label>
                    <input
                      dir="rtl"
                      value={draft.fullNameAr}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, fullNameAr: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Employee ID")}</label>
                    <input
                      value={draft.employeeCode}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, employeeCode: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Status")}</label>
                    <select
                      value={draft.status}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, status: e.target.value})}
                    >
                      {EMPLOYEE_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {adminText(s.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Job title (EN)")}</label>
                    <input
                      value={draft.jobTitleEn}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, jobTitleEn: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Job title (AR)")}</label>
                    <input
                      dir="rtl"
                      value={draft.jobTitleAr}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, jobTitleAr: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Department")}</label>
                    <select
                      value={draft.departmentId}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, departmentId: e.target.value})}
                    >
                      <option value="">—</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Reporting manager")}</label>
                    <select
                      value={draft.managerId}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, managerId: e.target.value})}
                    >
                      <option value="">—</option>
                      {items
                        .filter((e) => e.id !== draft.id)
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.fullNameEn}
                          </option>
                        ))}
                    </select>
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
                    <label>{adminText("WhatsApp")}</label>
                    <input
                      value={draft.whatsapp}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, whatsapp: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Joining date")}</label>
                    <input
                      type="date"
                      value={draft.joiningDate || ''}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, joiningDate: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("User account (CMS login)")}</label>
                    <select
                      value={draft.cmsUserId}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, cmsUserId: e.target.value})}
                    >
                      <option value="">{adminText("— Link later —")}</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name || u.email} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Website team profile (optional)")}</label>
                    <select
                      value={draft.teamMemberId}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, teamMemberId: e.target.value})}
                    >
                      <option value="">{adminText("— None —")}</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {adminText(m.name_en || m.id)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Skills (comma-separated)")}</label>
                  <input
                    value={draft.skills}
                    disabled={!canWrite}
                    onChange={(e) => setDraft({...draft, skills: e.target.value})}
                  />
                </div>
                <div className="adm-field">
                  <label>{adminText("Specializations (comma-separated)")}</label>
                  <input
                    value={draft.specializations}
                    disabled={!canWrite}
                    onChange={(e) => setDraft({...draft, specializations: e.target.value})}
                  />
                </div>
                <div className="adm-field">
                  <label>{adminText("Certifications (comma-separated)")}</label>
                  <input
                    value={draft.certifications}
                    disabled={!canWrite}
                    onChange={(e) => setDraft({...draft, certifications: e.target.value})}
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
                <p style={{fontSize: 13, color: 'var(--cms-muted)', margin: 0}}>{adminText("Create the login under")}{adminText(' ')}
                  <Link href="/admin/users">{adminText("Users")}</Link>{adminText(", then link it here — every employee should have their own account.")}</p>
              </div>
              {canWrite ? (
                <div className="adm-modal-foot">
                  <button type="submit" className="adm-btn" disabled={saving}>
                    {adminText(saving ? 'Saving…' : 'Save employee')}
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
