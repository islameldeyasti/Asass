'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import ProjectStagesPanel from '@/components/admin/ops/ProjectStagesPanel';
import ProjectTasksPanel from '@/components/admin/ops/ProjectTasksPanel';
import ProjectDocumentsPanel from '@/components/admin/ops/ProjectDocumentsPanel';
import ProjectApprovalsPanel from '@/components/admin/ops/ProjectApprovalsPanel';
import ProjectMeetingsPanel from '@/components/admin/ops/ProjectMeetingsPanel';
import ProjectCommentsPanel from '@/components/admin/ops/ProjectCommentsPanel';
import {
  MEMBER_ASSIGNMENT_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  PROJECT_TEAM_ROLES,
} from '@/lib/ops/constants';

const TABS = [
  {id: 'overview', label: 'Overview'},
  {id: 'team', label: 'Team'},
  {id: 'stages', label: 'Stages'},
  {id: 'tasks', label: 'Tasks'},
  {id: 'documents', label: 'Documents'},
  {id: 'meetings', label: 'Meetings'},
  {id: 'approvals', label: 'Approvals'},
  {id: 'activity', label: 'Communication'},
];

const EMPTY_MEMBER = {
  employeeId: '',
  projectRole: 'other',
  departmentId: '',
  responsibilities: '',
  startDate: '',
  endDate: '',
  workloadPercent: 50,
  status: 'active',
};

export default function Project360View({
  initialData,
  employees = [],
  departments = [],
  canWrite = false,
  canWriteDocs = false,
  canWriteApprovals = false,
  canWriteMeetings = false,
  canWriteComments = false,
}) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState('overview');
  const [memberDraft, setMemberDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const project = data?.project;
  const team = data?.team || [];

  const roleLabel = useMemo(
    () => Object.fromEntries(PROJECT_TEAM_ROLES.map((r) => [r.value, r.label])),
    [],
  );

  async function refresh() {
    const res = await fetch(`/api/admin/ops?resource=project&id=${encodeURIComponent(project.id)}`);
    const next = await res.json();
    if (res.ok) setData(next);
    router.refresh();
  }

  async function saveMember(event) {
    event.preventDefault();
    if (!canWrite || !memberDraft) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...memberDraft,
        projectId: project.id,
        departmentId: memberDraft.departmentId || null,
        workloadPercent: Number(memberDraft.workloadPercent) || 0,
      };
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({resource: 'project-members', document: payload}),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Save failed');
      setMemberDraft(null);
      await refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(id) {
    if (!canWrite) return;
    if (!window.confirm(adminText('Remove this team assignment?'))) return;
    const res = await fetch(
      `/api/admin/ops?resource=project-members&id=${encodeURIComponent(id)}`,
      {method: 'DELETE'},
    );
    const body = await res.json();
    if (!res.ok) {
      setError(body.error || 'Delete failed');
      return;
    }
    await refresh();
  }

  if (!project) {
    return <p className="adm-error">{adminText("Project not found.")}</p>;
  }

  return (
    <div className="ops-360">
      <div className="ops-360-hero adm-card">
        <div className="ops-360-hero-top">
          <div>
            <p className="ops-360-code">{adminText(project.code)}</p>
            <h2>{project.nameEn}</h2>
            <p className="adm-section-help" style={{marginBottom: 0}}>
              {adminText(data.client?.nameEn || 'No client')} · {adminText(project.location || project.emirate || project.country)}
            </p>
          </div>
          <div className="ops-360-hero-meta">
            <StatusBadge status={project.status}>
              {PROJECT_STATUSES.find((s) => s.value === project.status)?.label || project.status}
            </StatusBadge>
            <StatusBadge status={project.priority}>
              {PROJECT_PRIORITIES.find((s) => s.value === project.priority)?.label || project.priority}
            </StatusBadge>
          </div>
        </div>
        <div className="ops-360-kpis">
          <div>
            <span>{adminText("Progress")}</span>
            <strong>{adminText(project.progress || data.stageProgress || 0)}%</strong>
            <div className="ops-progress">
              <span style={{width: `${project.progress || data.stageProgress || 0}%`}} />
            </div>
          </div>
          <div>
            <span>{adminText("Current stage")}</span>
            <strong>{adminText(data.currentStage?.nameEn || '—')}</strong>
          </div>
          <div>
            <span>{adminText("Open / overdue")}</span>
            <strong>
              {adminText(data.counts?.openTasks || 0)} / {adminText(data.counts?.overdueTasks || 0)}
            </strong>
          </div>
          <div>
            <span>{adminText("Docs / approvals")}</span>
            <strong>
              {adminText(data.counts?.documents || 0)} / {adminText(data.counts?.pendingApprovals || 0)}
            </strong>
          </div>
        </div>
      </div>

      <nav className="ops-360-tabs" aria-label={adminText("Project sections")}>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'is-active' : ''}
            onClick={() => setTab(item.id)}
          >
            {adminText(item.label)}
          </button>
        ))}
      </nav>

      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      {tab === 'overview' ? (
        <div className="adm-grid-2">
          <section className="adm-card">
            <h3 className="adm-section-title" style={{marginTop: 0}}>{adminText("Project information")}</h3>
            <dl className="ops-360-dl">
              <div>
                <dt>{adminText("Type / Sector")}</dt>
                <dd>
                  {adminText(project.projectType || '—')} / {adminText(project.sector || '—')}
                </dd>
              </div>
              <div>
                <dt>{adminText("Dates")}</dt>
                <dd>
                  {adminText(project.startDate || '—')} → {adminText(project.plannedEndDate || '—')}
                </dd>
              </div>
              <div>
                <dt>{adminText("Contract value")}</dt>
                <dd>{adminText(project.contractValue != null ? project.contractValue.toLocaleString('ar-AE-u-nu-latn') : '—')}</dd>
              </div>
              <div>
                <dt>{adminText("Description")}</dt>
                <dd>{project.descriptionEn || adminText('No description yet.')}</dd>
              </div>
            </dl>
            <p style={{marginTop: 16}}>
              <Link href="/admin/ops/projects">{adminText("← All projects")}</Link>
            </p>
          </section>
          <section className="adm-card">
            <h3 className="adm-section-title" style={{marginTop: 0}}>{adminText("Health")}</h3>
            <ul className="ops-360-list">
              <li>{adminText("Stages: ")}<strong>{adminText(data.counts?.stages || 0)}</strong>{adminText(" · Tasks:")}{adminText(' ')}
                <strong>{adminText(data.counts?.tasks || 0)}</strong>{adminText(" · Blocked:")}{adminText(' ')}
                <strong>{adminText(data.counts?.blockedTasks || 0)}</strong>
              </li>
              <li>{adminText("Documents: ")}<strong>{adminText(data.counts?.documents || 0)}</strong>{adminText(" · Meetings:")}{adminText(' ')}
                <strong>{adminText(data.counts?.meetings || 0)}</strong>{adminText(" · Pending approvals:")}{adminText(' ')}
                <strong>{adminText(data.counts?.pendingApprovals || 0)}</strong>
              </li>
              <li>{adminText("Comments: ")}<strong>{adminText(data.counts?.comments || 0)}</strong>{adminText(" · Active team:")}{adminText(' ')}
                <strong>{adminText(team.filter((m) => m.status === 'active').length)}</strong>
              </li>
              <li>{adminText("Client contact: ")}{adminText(data.client?.contactName || '—')} ·{adminText(' ')}
                {adminText(data.client?.email || data.client?.phone || '—')}
              </li>
              <li>{adminText("PM: ")}{adminText(data.projectManager?.fullNameEn || '—')}{adminText(" · Director:")}{adminText(' ')}
                {adminText(data.projectDirector?.fullNameEn || '—')}
              </li>
            </ul>
          </section>
        </div>
      ) : null}

      {tab === 'team' ? (
        <div className="adm-stack">
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            {canWrite ? (
              <button type="button" className="adm-btn" onClick={() => setMemberDraft({...EMPTY_MEMBER})}>{adminText("Assign team member")}</button>
            ) : null}
          </div>
          <div className="adm-card" style={{padding: 0, overflow: 'auto'}}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>{adminText("Employee")}</th>
                  <th>{adminText("Role")}</th>
                  <th>{adminText("Department")}</th>
                  <th>{adminText("Workload")}</th>
                  <th>{adminText("Status")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <strong>{adminText(member.employee?.fullNameEn || 'Unknown')}</strong>
                      <div style={{fontSize: 12, color: 'var(--cms-muted)'}}>
                        {adminText(member.employee?.jobTitleEn || '—')}
                      </div>
                    </td>
                    <td>{adminText(roleLabel[member.projectRole] || member.projectRole)}</td>
                    <td>{adminText(member.department?.nameEn || '—')}</td>
                    <td>{adminText(member.workloadPercent || 0)}%</td>
                    <td>
                      <StatusBadge status={member.status}>
                        {MEMBER_ASSIGNMENT_STATUSES.find((s) => s.value === member.status)?.label ||
                          member.status}
                      </StatusBadge>
                    </td>
                    <td style={{textAlign: 'right'}}>
                      {canWrite ? (
                        <>
                          <button
                            type="button"
                            className="adm-btn-ghost"
                            onClick={() =>
                              setMemberDraft({
                                ...EMPTY_MEMBER,
                                ...member,
                                employeeId: member.employeeId || '',
                                departmentId: member.departmentId || '',
                                startDate: member.startDate || '',
                                endDate: member.endDate || '',
                              })
                            }
                          >{adminText("Edit")}</button>
                          <button
                            type="button"
                            className="adm-btn-ghost"
                            onClick={() => removeMember(member.id)}
                          >{adminText("Remove")}</button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {!team.length ? (
                  <tr>
                    <td colSpan={6} style={{padding: 24, color: 'var(--cms-muted)'}}>{adminText("No team assigned. Add directors, managers and discipline leads here.")}</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {memberDraft ? (
            <div
              className="adm-modal-backdrop"
              role="presentation"
              onClick={() => !saving && setMemberDraft(null)}
            >
              <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <div className="adm-modal-head">
                  <h2>{adminText(memberDraft.id ? 'Edit assignment' : 'Assign team member')}</h2>
                  <AdminCloseButton onClick={() => setMemberDraft(null)} disabled={saving} />
                </div>
                <form onSubmit={saveMember}>
                  <div className="adm-modal-body">
                    <div className="adm-grid-2">
                      <div className="adm-field">
                        <label>{adminText("Employee")}</label>
                        <select
                          required
                          value={memberDraft.employeeId}
                          onChange={(e) => setMemberDraft({...memberDraft, employeeId: e.target.value})}
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
                        <label>{adminText("Project role")}</label>
                        <select
                          value={memberDraft.projectRole}
                          onChange={(e) => setMemberDraft({...memberDraft, projectRole: e.target.value})}
                        >
                          {PROJECT_TEAM_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>
                              {adminText(r.label)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="adm-field">
                        <label>{adminText("Department")}</label>
                        <select
                          value={memberDraft.departmentId}
                          onChange={(e) => setMemberDraft({...memberDraft, departmentId: e.target.value})}
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
                        <label>{adminText("Workload %")}</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={memberDraft.workloadPercent}
                          onChange={(e) =>
                            setMemberDraft({...memberDraft, workloadPercent: e.target.value})
                          }
                        />
                      </div>
                      <div className="adm-field">
                        <label>{adminText("Status")}</label>
                        <select
                          value={memberDraft.status}
                          onChange={(e) => setMemberDraft({...memberDraft, status: e.target.value})}
                        >
                          {MEMBER_ASSIGNMENT_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {adminText(s.label)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="adm-field">
                        <label>{adminText("Start date")}</label>
                        <input
                          type="date"
                          value={memberDraft.startDate || ''}
                          onChange={(e) => setMemberDraft({...memberDraft, startDate: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="adm-field">
                      <label>{adminText("Responsibilities")}</label>
                      <textarea
                        rows={3}
                        value={memberDraft.responsibilities}
                        onChange={(e) =>
                          setMemberDraft({...memberDraft, responsibilities: e.target.value})
                        }
                      />
                    </div>
                  </div>
                  <div className="adm-modal-foot">
                    <button type="submit" className="adm-btn" disabled={saving}>
                      {adminText(saving ? 'Saving…' : 'Save assignment')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === 'stages' ? (
        <ProjectStagesPanel
          projectId={project.id}
          stages={data.stages || []}
          employees={employees}
          departments={departments}
          canWrite={canWrite}
          onChanged={refresh}
        />
      ) : null}

      {tab === 'tasks' ? (
        <ProjectTasksPanel
          projectId={project.id}
          tasks={data.tasks || []}
          stages={data.stages || []}
          employees={employees}
          departments={departments}
          canWrite={canWrite}
          onChanged={refresh}
        />
      ) : null}

      {tab === 'documents' ? (
        <ProjectDocumentsPanel
          projectId={project.id}
          documents={data.documents || []}
          stages={data.stages || []}
          canWrite={canWriteDocs}
          onChanged={refresh}
        />
      ) : null}

      {tab === 'meetings' ? (
        <ProjectMeetingsPanel
          projectId={project.id}
          meetings={data.meetings || []}
          employees={employees}
          canWrite={canWriteMeetings}
          onChanged={refresh}
        />
      ) : null}

      {tab === 'approvals' ? (
        <ProjectApprovalsPanel
          projectId={project.id}
          approvals={data.approvals || []}
          stages={data.stages || []}
          tasks={data.tasks || []}
          documents={data.documents || []}
          employees={employees}
          canWrite={canWriteApprovals}
          onChanged={refresh}
        />
      ) : null}

      {tab === 'activity' ? (
        <ProjectCommentsPanel
          projectId={project.id}
          comments={data.comments || []}
          employees={employees}
          canWrite={canWriteComments}
          onChanged={refresh}
        />
      ) : null}
    </div>
  );
}
