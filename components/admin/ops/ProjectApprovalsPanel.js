'use client';
import {adminText} from '@/lib/admin/translate';


import {useState} from 'react';
import {useRouter} from 'next/navigation';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {APPROVAL_STATUSES, APPROVAL_SUBJECT_TYPES} from '@/lib/ops/constants';

const EMPTY = {
  title: '',
  subjectType: 'document',
  subjectId: '',
  stepsText: '',
};

export default function ProjectApprovalsPanel({
  projectId,
  approvals: initialApprovals = [],
  documents = [],
  stages = [],
  tasks = [],
  employees = [],
  canWrite = false,
  onChanged,
}) {
  const router = useRouter();
  const [approvals, setApprovals] = useState(initialApprovals);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [previousApprovals, setPreviousApprovals] = useState(initialApprovals);
  if (previousApprovals !== initialApprovals) {
    setPreviousApprovals(initialApprovals);
    setApprovals(initialApprovals);
  }

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn]));

  async function refreshList() {
    const res = await fetch(
      `/api/admin/ops?resource=approvals&projectId=${encodeURIComponent(projectId)}`,
    );
    const body = await res.json();
    if (res.ok) setApprovals(body.items || []);
    onChanged?.();
    router.refresh();
  }

  async function onSave(event) {
    event.preventDefault();
    if (!canWrite || !draft) return;
    setSaving(true);
    setError('');
    try {
      const steps = String(draft.stepsText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, index) => {
          const [title, approverEmployeeId] = line.split('|').map((p) => p.trim());
          return {
            title: title || `Step ${index + 1}`,
            approverEmployeeId: approverEmployeeId || null,
            order: index + 1,
            status: 'pending',
          };
        });
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          resource: 'approvals',
          document: {
            id: draft.id || undefined,
            title: draft.title,
            projectId,
            subjectType: draft.subjectType,
            subjectId: draft.subjectId || null,
            steps: draft.id && draft.steps?.length ? draft.steps : steps,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDraft(null);
      await refreshList();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function decide(approvalId, stepId, status) {
    if (!canWrite) return;
    const comment = window.prompt(status === 'approved' ? 'Comment (optional)' : 'Reason / comment') || '';
    if (status !== 'approved' && !comment.trim()) return;
    setError('');
    const res = await fetch('/api/admin/ops', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        resource: 'approval-decide',
        document: {approvalId, stepId, status, comment},
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Decision failed');
      return;
    }
    await refreshList();
  }

  async function onDelete(id) {
    if (!canWrite) return;
    if (!window.confirm(adminText('Delete this approval request?'))) return;
    const res = await fetch(
      `/api/admin/ops?resource=approvals&id=${encodeURIComponent(id)}`,
      {method: 'DELETE'},
    );
    const body = await res.json();
    if (!res.ok) {
      setError(body.error || 'Delete failed');
      return;
    }
    await refreshList();
  }

  return (
    <div className="adm-stack">
      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        {canWrite ? (
          <button type="button" className="adm-btn" onClick={() => setDraft({...EMPTY})}>{adminText("Request approval")}</button>
        ) : null}
      </div>
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      <div className="adm-stack">
        {approvals.map((approval) => (
          <section key={approval.id} className="adm-card">
            <div style={{display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'}}>
              <div>
                <h3 className="adm-section-title" style={{marginTop: 0, marginBottom: 4}}>
                  {adminText(approval.title)}
                </h3>
                <p className="adm-section-help" style={{margin: 0}}>
                  {APPROVAL_SUBJECT_TYPES.find((s) => s.value === approval.subjectType)?.label ||
                    approval.subjectType}
                  {adminText(approval.subjectId ? ` · ${approval.subjectId}` : '')}
                </p>
              </div>
              <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
                <StatusBadge status={approval.status}>
                  {APPROVAL_STATUSES.find((s) => s.value === approval.status)?.label || approval.status}
                </StatusBadge>
                {canWrite ? (
                  <button type="button" className="adm-btn-ghost" onClick={() => onDelete(approval.id)}>{adminText("Delete")}</button>
                ) : null}
              </div>
            </div>
            <ol style={{margin: '12px 0 0', paddingLeft: 18}}>
              {(approval.steps || []).map((step) => (
                <li key={step.id} style={{marginBottom: 8}}>
                  <strong>{adminText(step.title)}</strong>
                  <span style={{color: 'var(--cms-muted)'}}>
                    {adminText(' · ')}
                    {adminText(empMap[step.approverEmployeeId] || 'Unassigned')}
                  </span>
                  {adminText(' ')}
                  <StatusBadge status={step.status}>
                    {APPROVAL_STATUSES.find((s) => s.value === step.status)?.label || step.status}
                  </StatusBadge>
                  {step.comment ? (
                    <div style={{fontSize: 12, color: 'var(--cms-muted)'}}>{adminText(step.comment)}</div>
                  ) : null}
                  {canWrite && step.status === 'pending' ? (
                    <div style={{marginTop: 4}}>
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() => decide(approval.id, step.id, 'approved')}
                      >{adminText("Approve")}</button>
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() => decide(approval.id, step.id, 'returned')}
                      >{adminText("Return")}</button>
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() => decide(approval.id, step.id, 'rejected')}
                      >{adminText("Reject")}</button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ))}
        {!approvals.length ? (
          <div className="adm-card">
            <p className="adm-section-help" style={{margin: 0}}>{adminText("No approval requests yet. Create multi-step reviews for documents, stages, or project gates.")}</p>
          </div>
        ) : null}
      </div>

      {draft ? (
        <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText("Request approval")}</h2>
              <AdminCloseButton onClick={() => setDraft(null)} disabled={saving} />
            </div>
            <form onSubmit={onSave}>
              <div className="adm-modal-body">
                <div className="adm-field">
                  <label>{adminText("Title")}</label>
                  <input
                    required
                    value={draft.title}
                    onChange={(e) => setDraft({...draft, title: e.target.value})}
                  />
                </div>
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <label>{adminText("Subject type")}</label>
                    <select
                      value={draft.subjectType}
                      onChange={(e) => setDraft({...draft, subjectType: e.target.value, subjectId: ''})}
                    >
                      {APPROVAL_SUBJECT_TYPES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {adminText(s.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Subject")}</label>
                    {draft.subjectType === 'document' ? (
                      <select
                        value={draft.subjectId}
                        onChange={(e) => setDraft({...draft, subjectId: e.target.value})}
                      >
                        <option value="">—</option>
                        {documents.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : draft.subjectType === 'project' ? <input readOnly value={projectId}/> : (
                      <select value={draft.subjectId} onChange={e=>setDraft({...draft,subjectId:e.target.value})}>
                        <option value="">{adminText("Select ")}{adminText(draft.subjectType)}</option>
                        {(draft.subjectType==='stage'?stages:tasks).map(item=><option key={item.id} value={item.id}>{item.nameEn||item.title}</option>)}
                      </select>
                    )}
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Steps (one per line: Title | employeeId)")}</label>
                  <textarea
                    required
                    rows={4}
                    placeholder={adminText('PM Review | emp_xxx\nDirector Sign-off | emp_yyy')}
                    value={draft.stepsText}
                    onChange={(e) => setDraft({...draft, stepsText: e.target.value})}
                  />
                  <p className="adm-section-help">{adminText("Pick employee ids from the list below, or paste ids from HR profiles.")}</p>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (!e.target.value) return;
                      const line = `Review | ${e.target.value}`;
                      setDraft({
                        ...draft,
                        stepsText: draft.stepsText ? `${draft.stepsText}\n${line}` : line,
                      });
                      e.target.value = '';
                    }}
                  >
                    <option value="">{adminText("Add step from employee…")}</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.fullNameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="adm-modal-foot">
                <button type="submit" className="adm-btn" disabled={saving}>
                  {adminText(saving ? 'Saving…' : 'Create request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
