'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {OpsMetrics, OpsEmpty} from './OpsUI';
import TaskQuickCreate from './TaskQuickCreate';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {TASK_STATUSES} from '@/lib/ops/constants';

const BUCKET_META = [
  {id: 'overdue', label: 'Overdue'},
  {id: 'dueToday', label: 'Due today'},
  {id: 'dueThisWeek', label: 'Due this week'},
  {id: 'upcoming', label: 'Upcoming'},
  {id: 'blocked', label: 'Blocked'},
  {id: 'completed', label: 'Completed'},
];

export default function MyTasksBoard({
  initialBoard,
  employees = [],
  projects = [],
  canWrite = false,
  currentEmployeeId = null,
}) {
  const router = useRouter();
  const [board, setBoard] = useState(initialBoard);
  const [view, setView] = useState('kanban');
  const [creating,setCreating]=useState(false);
  const [query,setQuery]=useState('');
  const [projectFilter,setProjectFilter]=useState('');
  const [busy,setBusy]=useState(false);
  const matches = (task) => (!projectFilter || task.projectId===projectFilter) && `${task.title} ${task.project?.nameEn||''}`.toLowerCase().includes(query.toLowerCase());
  const [assigneeId, setAssigneeId] = useState(initialBoard?.assigneeId || currentEmployeeId || '');
  const [error, setError] = useState('');
  const [draggingId, setDraggingId] = useState(null);

  const kanbanColumns = useMemo(
    () => TASK_STATUSES.filter((s) => s.value !== 'cancelled'),
    [],
  );

  async function reload(nextAssignee = assigneeId) {
    const qs = new URLSearchParams({resource: 'my-tasks'});
    if (nextAssignee) qs.set('assigneeId', nextAssignee);
    else qs.set('scope','all');
    setBusy(true);
    try {
    const res = await fetch(`/api/admin/ops?${qs.toString()}`);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Could not load tasks');
      return;
    }
    setBoard(data);
    router.refresh();
    } catch(err) { setError(err.message || 'Could not load tasks'); } finally {setBusy(false);}
  }

  async function moveTask(taskId, status) {
    if (!canWrite || busy) return;
    setError('');
    setBusy(true);
    try {
    const res = await fetch('/api/admin/ops', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({resource: 'task-status', document: {id: taskId, status}}),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Could not update status');
      return;
    }
    await reload();
    } catch(err) {setError(err.message || 'Could not update task');} finally {setBusy(false);}
  }

  function onDrop(status) {
    if (!draggingId) return;
    moveTask(draggingId, status);
    setDraggingId(null);
  }

  return (
    <div className="adm-stack">
      <OpsMetrics items={[{label:'Assigned work',value:board?.total||0,hint:'For the selected assignee'},{label:'Overdue',value:board?.buckets?.overdue?.length||0,hint:'Requires a delivery update',tone:'danger'},{label:'In review',value:board?.kanban?.in_review?.length||0,hint:'Awaiting a review decision',tone:'warning'},{label:'Completed',value:board?.buckets?.completed?.length||0,hint:'Finished deliverables',tone:'good'}]}/>
      <div className="ops-toolbar"><input aria-label={adminText("Search tasks")} placeholder={adminText("Search tasks or projects…")} value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label={adminText("Filter tasks by project")} value={projectFilter} onChange={e=>setProjectFilter(e.target.value)}><option value="">{adminText("All projects")}</option>{projects.map(p=><option key={p.id} value={p.id}>{p.nameEn}</option>)}</select>{canWrite&&<button className="adm-btn" onClick={()=>setCreating(true)}>{adminText("+ New task")}</button>}</div>
      <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'}}>
        <select
          aria-label={adminText("Filter tasks by assignee")}
          disabled={busy}
          value={assigneeId}
          onChange={(e) => {
            setAssigneeId(e.target.value);
            reload(e.target.value);
          }}
        >
          <option value="">{adminText("All assignees (filter)")}</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.fullNameEn}
            </option>
          ))}
        </select>
        <div className="ops-view-toggle">
          <button type="button" className={view === 'list' ? 'is-active' : ''} onClick={() => setView('list')}>{adminText("My lists")}</button>
          <button
            type="button"
            className={view === 'kanban' ? 'is-active' : ''}
            onClick={() => setView('kanban')}
          >{adminText("Kanban")}</button>
        </div>
      </div>
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      {view === 'list' ? (
        <div className="ops-my-grid">
          {BUCKET_META.map((bucket) => (
            <section key={bucket.id} className="adm-card ops-my-bucket">
              <header>
                <h3>{adminText(bucket.label)}</h3>
                <span>{adminText(board?.buckets?.[bucket.id]?.filter(matches).length || 0)}</span>
              </header>
              <ul>
                {(board?.buckets?.[bucket.id] || []).filter(matches).map((task) => (
                  <li key={task.id}>
                    <Link href={task.projectId ? `/admin/ops/projects/${task.projectId}` : '/admin/ops/projects'}>
                      <strong>{adminText(task.title)}</strong>
                      <span>
                        {adminText(task.project?.nameEn || 'Project')} · {adminText(task.dueDate || 'No due date')}
                      </span>
                    </Link>
                    <StatusBadge status={task.status}>
                      {TASK_STATUSES.find((s) => s.value === task.status)?.label || task.status}
                    </StatusBadge>
                  </li>
                ))}
                {!board?.buckets?.[bucket.id]?.filter(matches).length ? (
                  <li className="ops-org-muted">{adminText("No tasks in this category.")}</li>
                ) : null}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="ops-kanban">
          {kanbanColumns.map((col) => (
            <section
              key={col.value}
              className="ops-kanban-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.value)}
            >
              <header>
                <h3>{adminText(col.label)}</h3>
                <span>{board?.kanban?.[col.value]?.filter(matches).length || 0}</span>
              </header>
              <div className="ops-kanban-list">
                {!(board?.kanban?.[col.value] || []).filter(matches).length&&<OpsEmpty title={adminText("No tasks")} description={adminText("Tasks appear here as work progresses.")}/>}
                {(board?.kanban?.[col.value] || []).filter(matches).map((task) => (
                  <article
                    key={task.id}
                    className="ops-kanban-card"
                    draggable={canWrite && !busy}
                    onDragStart={() => setDraggingId(task.id)}
                    onDragEnd={() => setDraggingId(null)}
                  >
                    <Link href={`/admin/ops/projects/${task.projectId}`}><strong>{adminText(task.title)}</strong></Link>
                    <p>{adminText(task.project?.nameEn || '—')}</p>
                    <div className="ops-kanban-card-meta">
                      <span>{adminText(task.dueDate || 'No due')}</span>
                      {canWrite ? (
                        <select
                          aria-label={adminText(`Status for ${task.title}`)}
                          disabled={busy}
                          value={task.status}
                          onChange={(e) => moveTask(task.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {TASK_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {adminText(s.label)}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      {creating&&<TaskQuickCreate projects={projects} employees={employees} onClose={()=>setCreating(false)} onSaved={()=>reload()}/>}
    </div>
  );
}
