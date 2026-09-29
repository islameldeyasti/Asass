'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {STAGE_STATUSES} from '@/lib/ops/constants';

export default function ProjectStagesPanel({
  projectId,
  stages: initialStages = [],
  employees = [],
  departments = [],
  canWrite = false,
  onChanged,
}) {
  const router = useRouter();
  const [stages, setStages] = useState(initialStages);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const empMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn])),
    [employees],
  );

  async function applyTemplate(force = false) {
    if (!canWrite) return;
    if (stages.length && !force) {
      if (!window.confirm(adminText('Replace existing stages with the default workflow template?'))) return;
      force = true;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          resource: 'apply-stages',
          document: {projectId, force},
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not apply workflow');
      setStages(data.items || []);
      onChanged?.();
      router.refresh();
    } catch (err) {
      setError(err.message || 'Could not apply workflow');
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
        body: JSON.stringify({
          resource: 'project-stages',
          document: {
            ...draft,
            projectId,
            progress: Number(draft.progress) || 0,
            responsibleEmployeeId: draft.responsibleEmployeeId || null,
            responsibleDepartmentId: draft.responsibleDepartmentId || null,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setStages((current) => {
        const next = current.filter((s) => s.id !== data.document.id);
        next.push(data.document);
        return next.sort((a, b) => a.order - b.order);
      });
      setDraft(null);
      onChanged?.();
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="adm-stack">
      <div style={{display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap'}}>
        {canWrite ? (
          <>
            <button type="button" className="adm-btn-ghost" onClick={() => applyTemplate(false)} disabled={saving}>
              {adminText(stages.length ? 'Re-apply workflow template' : 'Apply workflow template')}
            </button>
            <button
              type="button"
              className="adm-btn"
              onClick={() =>
                setDraft({
                  nameEn: '',
                  nameAr: '',
                  descriptionEn: '',
                  order: (stages.length + 1) * 10,
                  status: 'not_started',
                  progress: 0,
                  responsibleEmployeeId: '',
                  responsibleDepartmentId: '',
                  startDate: '',
                  dueDate: '',
                })
              }
            >{adminText("Add stage")}</button>
          </>
        ) : null}
      </div>
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      <div className="ops-stage-timeline">
        {stages.map((stage, index) => (
          <article key={stage.id} className={`ops-stage-card is-${stage.status}`}>
            <div className="ops-stage-index">{adminText(String(stage.order || index + 1).padStart(2, '0'))}</div>
            <div className="ops-stage-body">
              <div className="ops-stage-head">
                <h4>{stage.nameEn}</h4>
                <StatusBadge status={stage.status}>
                  {STAGE_STATUSES.find((s) => s.value === stage.status)?.label || stage.status}
                </StatusBadge>
              </div>
              <p>{stage.descriptionEn || stage.responsibleRole || adminText('Delivery stage')}</p>{stage.requiresApproval&&<span className="ops-pill warning">{adminText("Approval required")}</span>}{stage.requiredDocuments&&<p>{adminText("Deliverables: ")}{adminText(stage.requiredDocuments)}</p>}
              <div className="ops-stage-meta">
                <span>{adminText("Owner: ")}{adminText(empMap[stage.responsibleEmployeeId] || '—')}</span>
                <span>{adminText("Due: ")}{adminText(stage.dueDate || '—')}</span>
                <span>{adminText(stage.progress || 0)}%</span>
              </div>
              <div className="ops-progress">
                <span style={{width: `${stage.progress || 0}%`}} />
              </div>
            </div>
            {canWrite ? (
              <button
                type="button"
                className="adm-btn-ghost"
                onClick={() =>
                  setDraft({
                    ...stage,
                    responsibleEmployeeId: stage.responsibleEmployeeId || '',
                    responsibleDepartmentId: stage.responsibleDepartmentId || '',
                    startDate: stage.startDate || '',
                    dueDate: stage.dueDate || '',
                  })
                }
              >{adminText("Edit")}</button>
            ) : null}
          </article>
        ))}
        {!stages.length ? (
          <div className="adm-card">
            <p className="adm-section-help" style={{margin: 0}}>{adminText("No stages yet. Apply the ASAS standard workflow template (23 configurable stages) or add stages manually.")}</p>
          </div>
        ) : null}
      </div>

      {draft ? (
        <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText(draft.id ? 'Edit stage' : 'Add stage')}</h2>
              <AdminCloseButton onClick={() => setDraft(null)} disabled={saving} />
            </div>
            <form onSubmit={onSave}>
              <div className="adm-modal-body">
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <label>{adminText("Name (EN)")}</label>
                    <input
                      required
                      value={draft.nameEn}
                      onChange={(e) => setDraft({...draft, nameEn: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Status")}</label>
                    <select
                      value={draft.status}
                      onChange={(e) => setDraft({...draft, status: e.target.value})}
                    >
                      {STAGE_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {adminText(s.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Order")}</label>
                    <input
                      type="number"
                      value={draft.order}
                      onChange={(e) => setDraft({...draft, order: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Progress %")}</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={draft.progress}
                      onChange={(e) => setDraft({...draft, progress: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Responsible")}</label>
                    <select
                      value={draft.responsibleEmployeeId}
                      onChange={(e) => setDraft({...draft, responsibleEmployeeId: e.target.value})}
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
                    <label>{adminText("Department")}</label>
                    <select
                      value={draft.responsibleDepartmentId}
                      onChange={(e) => setDraft({...draft, responsibleDepartmentId: e.target.value})}
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
                    <label>{adminText("Start")}</label>
                    <input
                      type="date"
                      value={draft.startDate || ''}
                      onChange={(e) => setDraft({...draft, startDate: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Due")}</label>
                    <input
                      type="date"
                      value={draft.dueDate || ''}
                      onChange={(e) => setDraft({...draft, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Description")}</label>
                  <textarea
                    rows={3}
                    value={draft.descriptionEn || ''}
                    onChange={(e) => setDraft({...draft, descriptionEn: e.target.value})}
                  />
                </div>
              </div>
              <div className="adm-modal-foot">
                <button type="submit" className="adm-btn" disabled={saving}>
                  {adminText(saving ? 'Saving…' : 'Save stage')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
