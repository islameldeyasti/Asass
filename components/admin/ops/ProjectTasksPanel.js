'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {TASK_PRIORITIES, TASK_STATUSES} from '@/lib/ops/constants';

const EMPTY = {
  title: '',
  description: '',
  stageId: '',
  assigneeIds: [],
  departmentId: '',
  priority: 'normal',
  status: 'todo',
  startDate: '',
  dueDate: '',
  estimatedHours: '',
  progress: 0,
  dependencyIds: [],
  checklistText: '',
};

export default function ProjectTasksPanel({
  projectId,
  tasks: initialTasks = [],
  stages = [],
  employees = [],
  departments = [],
  canWrite = false,
  onChanged,
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const stageMap = useMemo(
    () => Object.fromEntries(stages.map((s) => [s.id, s.nameEn])),
    [stages],
  );

  async function onSave(event) {
    event.preventDefault();
    if (!canWrite || !draft) return;
    setSaving(true);
    setError('');
    try {
      const checklist = String(draft.checklistText || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((text) => ({text, done: false}));
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          resource: 'tasks',
          document: {
            ...draft,
            projectId,
            stageId: draft.stageId || null,
            departmentId: draft.departmentId || null,
            assigneeIds: draft.assigneeIds || [],
            dependencyIds: draft.dependencyIds || [],
            estimatedHours: draft.estimatedHours === '' ? null : Number(draft.estimatedHours),
            progress: Number(draft.progress) || 0,
            checklist: draft.id ? draft.checklist || checklist : checklist,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDraft(null);
      onChanged?.();
      const refresh = await fetch(`/api/admin/ops?resource=tasks&projectId=${encodeURIComponent(projectId)}`);
      const body = await refresh.json();
      if (refresh.ok) setTasks(body.items || []);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id, status) {
    if (!canWrite) return;
    setError('');
    const res = await fetch('/api/admin/ops', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({resource: 'task-status', document: {id, status}}),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Status update failed');
      return;
    }
    onChanged?.();
    const refresh = await fetch(`/api/admin/ops?resource=tasks&projectId=${encodeURIComponent(projectId)}`);
    const body = await refresh.json();
    if (refresh.ok) setTasks(body.items || []);
    router.refresh();
  }

  function toggleAssignee(id) {
    const current = new Set(draft.assigneeIds || []);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    setDraft({...draft, assigneeIds: [...current]});
  }

  function toggleDependency(id) {
    const current = new Set(draft.dependencyIds || []);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    setDraft({...draft, dependencyIds: [...current]});
  }

  return (
    <div className="adm-stack">
      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        {canWrite ? (
          <button type="button" className="adm-btn" onClick={() => setDraft({...EMPTY})}>{adminText("New task")}</button>
        ) : null}
      </div>
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      <div className="adm-card" style={{padding: 0, overflow: 'auto'}}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>{adminText("Task")}</th>
              <th>{adminText("Stage")}</th>
              <th>{adminText("Assignees")}</th>
              <th>{adminText("Due")}</th>
              <th>{adminText("Status")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>
                  <strong>{adminText(task.title)}</strong>
                  {task.dependencyIds?.length ? (
                    <div style={{fontSize: 12, color: 'var(--cms-muted)'}}>{adminText("Depends on ")}{adminText(task.dependencyIds.length)}{adminText(" task(s)")}</div>
                  ) : null}
                </td>
                <td>{adminText(stageMap[task.stageId] || '—')}</td>
                <td>{(task.assignees || []).map((a) => a.fullNameEn).join(', ') || '—'}</td>
                <td>{adminText(task.dueDate || '—')}</td>
                <td>
                  {canWrite ? (
                    <select
                      value={task.status}
                      onChange={(e) => setStatus(task.id, e.target.value)}
                      style={{maxWidth: 140}}
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {adminText(s.label)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <StatusBadge status={task.status}>
                      {TASK_STATUSES.find((s) => s.value === task.status)?.label || task.status}
                    </StatusBadge>
                  )}
                </td>
                <td style={{textAlign: 'right'}}>
                  {canWrite ? (
                    <button
                      type="button"
                      className="adm-btn-ghost"
                      onClick={() =>
                        setDraft({
                          ...EMPTY,
                          ...task,
                          stageId: task.stageId || '',
                          departmentId: task.departmentId || '',
                          assigneeIds: task.assigneeIds || [],
                          dependencyIds: task.dependencyIds || [],
                          estimatedHours: task.estimatedHours ?? '',
                          startDate: task.startDate || '',
                          dueDate: task.dueDate || '',
                          checklistText: (task.checklist || []).map((c) => c.text).join('\n'),
                        })
                      }
                    >{adminText("Edit")}</button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!tasks.length ? (
              <tr>
                <td colSpan={6} style={{padding: 24, color: 'var(--cms-muted)'}}>{adminText("No tasks yet. Create tasks and link them to stages. Incomplete dependencies keep dependent tasks blocked.")}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText(draft.id ? 'Edit task' : 'New task')}</h2>
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
                <div className="adm-field">
                  <label>{adminText("Description")}</label>
                  <textarea
                    rows={3}
                    value={draft.description}
                    onChange={(e) => setDraft({...draft, description: e.target.value})}
                  />
                </div>
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <label>{adminText("Stage")}</label>
                    <select
                      value={draft.stageId}
                      onChange={(e) => setDraft({...draft, stageId: e.target.value})}
                    >
                      <option value="">—</option>
                      {stages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Priority")}</label>
                    <select
                      value={draft.priority}
                      onChange={(e) => setDraft({...draft, priority: e.target.value})}
                    >
                      {TASK_PRIORITIES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {adminText(s.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Status")}</label>
                    <select
                      value={draft.status}
                      onChange={(e) => setDraft({...draft, status: e.target.value})}
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {adminText(s.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Department")}</label>
                    <select
                      value={draft.departmentId}
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
                    <label>{adminText("Due date")}</label>
                    <input
                      type="date"
                      value={draft.dueDate || ''}
                      onChange={(e) => setDraft({...draft, dueDate: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Estimated hours")}</label>
                    <input
                      type="number"
                      value={draft.estimatedHours}
                      onChange={(e) => setDraft({...draft, estimatedHours: e.target.value})}
                    />
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Assignees")}</label>
                  <div className="ops-check-grid">
                    {employees.map((e) => (
                      <label key={e.id} className="adm-check">
                        <input
                          type="checkbox"
                          checked={(draft.assigneeIds || []).includes(e.id)}
                          onChange={() => toggleAssignee(e.id)}
                        />
                        {e.fullNameEn}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Depends on")}</label>
                  <div className="ops-check-grid">
                    {tasks
                      .filter((t) => t.id !== draft.id)
                      .map((t) => (
                        <label key={t.id} className="adm-check">
                          <input
                            type="checkbox"
                            checked={(draft.dependencyIds || []).includes(t.id)}
                            onChange={() => toggleDependency(t.id)}
                          />
                          {adminText(t.title)}
                        </label>
                      ))}
                    {!tasks.filter((t) => t.id !== draft.id).length ? (
                      <span style={{color: 'var(--cms-muted)', fontSize: 13}}>{adminText("No other tasks yet")}</span>
                    ) : null}
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Checklist (one item per line)")}</label>
                  <textarea
                    rows={4}
                    value={draft.checklistText}
                    onChange={(e) => setDraft({...draft, checklistText: e.target.value})}
                  />
                </div>
              </div>
              <div className="adm-modal-foot">
                <button type="submit" className="adm-btn" disabled={saving}>
                  {adminText(saving ? 'Saving…' : 'Save task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
