'use client';
import {adminText} from '@/lib/admin/translate';


import {useEffect, useState} from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {APPROVAL_STATUSES, APPROVAL_SUBJECT_TYPES} from '@/lib/ops/constants';

export default function ApprovalsInbox({
  initialItems = [],
  employees = [],
  projects = [],
  canWrite = false,
}) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn]));
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  const visible = items.filter((a) => (filter === 'all' ? true : a.status === filter));

  async function refresh() {
    const res = await fetch('/api/admin/ops?resource=approvals');
    const body = await res.json();
    if (res.ok) setItems(body.items || []);
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
    await refresh();
  }

  return (
    <div className="adm-stack">
      <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
        {['pending', 'approved', 'rejected', 'returned', 'all'].map((key) => (
          <button
            key={key}
            type="button"
            className={filter === key ? 'adm-btn' : 'adm-btn-ghost'}
            onClick={() => setFilter(key)}
          >
            {key === 'all' ? adminText('All') : APPROVAL_STATUSES.find((s) => s.value === key)?.label || key}
          </button>
        ))}
      </div>
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      {visible.map((approval) => {
        const project = projectMap[approval.projectId];
        return (
          <section key={approval.id} className="adm-card">
            <div style={{display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'}}>
              <div>
                <h2 className="adm-section-title" style={{marginTop: 0, marginBottom: 4}}>
                  {adminText(approval.title)}
                </h2>
                <p className="adm-section-help" style={{margin: 0}}>
                  {project ? (
                    <Link href={`/admin/ops/projects/${project.id}`}>
                      {adminText(project.code)} · {project.nameEn}
                    </Link>
                  ) : (
                    adminText('No project')
                  )}
                  {adminText(' · ')}
                  {APPROVAL_SUBJECT_TYPES.find((s) => s.value === approval.subjectType)?.label ||
                    approval.subjectType}
                </p>
              </div>
              <StatusBadge status={approval.status}>
                {APPROVAL_STATUSES.find((s) => s.value === approval.status)?.label || approval.status}
              </StatusBadge>
            </div>
            <ol style={{margin: '12px 0 0', paddingLeft: 18}}>
              {(approval.steps || []).map((step) => (
                <li key={step.id} style={{marginBottom: 8}}>
                  <strong>{adminText(step.title)}</strong>
                  <span style={{color: 'var(--cms-muted)'}}>
                    {adminText(' · ')}
                    {adminText(empMap[step.approverEmployeeId] || 'Unassigned')}
                  </span>{adminText(' ')}
                  <StatusBadge status={step.status}>
                    {APPROVAL_STATUSES.find((s) => s.value === step.status)?.label || step.status}
                  </StatusBadge>
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
        );
      })}

      {!visible.length ? (
        <div className="adm-card">
          <p className="adm-section-help" style={{margin: 0}}>{adminText("No approvals in this filter. Create requests from a project’s Approvals tab.")}</p>
        </div>
      ) : null}
    </div>
  );
}
