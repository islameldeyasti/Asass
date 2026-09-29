import {validateDateRange, requireExisting, invalid} from './validation';
import {officeToday} from './presentation';
import {TASK_PRIORITIES, TASK_STATUSES} from './constants';
import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

const STATUS_SET = new Set(TASK_STATUSES.map((s) => s.value));
const PRIORITY_SET = new Set(TASK_PRIORITIES.map((s) => s.value));

function clampProgress(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeChecklistItem(raw = {}) {
  return {
    id: raw.id || newOpsId('chk'),
    text: String(raw.text || '').trim(),
    done: Boolean(raw.done),
  };
}

function normalizeTask(raw = {}) {
  let status = STATUS_SET.has(raw.status) ? raw.status : 'todo';
  const priority = PRIORITY_SET.has(raw.priority) ? raw.priority : 'normal';
  const assigneeIds = Array.isArray(raw.assigneeIds)
    ? raw.assigneeIds.filter(Boolean)
    : raw.assigneeId
      ? [raw.assigneeId]
      : [];
  const dependencyIds = Array.isArray(raw.dependencyIds) ? raw.dependencyIds.filter(Boolean) : [];
  const checklist = Array.isArray(raw.checklist)
    ? raw.checklist.map(normalizeChecklistItem).filter((c) => c.text)
    : [];

  return {
    id: raw.id || newOpsId('tsk'),
    title: String(raw.title || '').trim(),
    description: String(raw.description || '').trim(),
    projectId: raw.projectId || null,
    stageId: raw.stageId || null,
    parentTaskId: raw.parentTaskId || null,
    assigneeIds,
    /** Primary assignee (first) for convenience filters. */
    assigneeId: assigneeIds[0] || null,
    departmentId: raw.departmentId || null,
    createdByEmployeeId: raw.createdByEmployeeId || null,
    createdByUserId: raw.createdByUserId || null,
    priority,
    status,
    startDate: raw.startDate || null,
    dueDate: raw.dueDate || null,
    completionDate: raw.completionDate || null,
    estimatedHours: raw.estimatedHours === '' || raw.estimatedHours == null ? null : Number(raw.estimatedHours),
    actualHours: raw.actualHours === '' || raw.actualHours == null ? null : Number(raw.actualHours),
    progress: clampProgress(raw.progress),
    dependencyIds,
    checklist,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

async function readAllTasks() {
  return (await readOpsCollection('tasks', [])).map(normalizeTask);
}

export async function listTasks(filters = {}) {
  let items = await readAllTasks();
  if (filters.projectId) items = items.filter((t) => t.projectId === filters.projectId);
  if (filters.stageId) items = items.filter((t) => t.stageId === filters.stageId);
  if (filters.status) items = items.filter((t) => t.status === filters.status);
  if (filters.assigneeId) {
    items = items.filter(
      (t) => t.assigneeId === filters.assigneeId || t.assigneeIds.includes(filters.assigneeId),
    );
  }
  if (filters.departmentId) items = items.filter((t) => t.departmentId === filters.departmentId);
  return items.sort((a, b) => {
    const dueA = a.dueDate || '9999';
    const dueB = b.dueDate || '9999';
    return dueA.localeCompare(dueB) || a.title.localeCompare(b.title);
  });
}

export async function getTask(id) {
  const items = await readAllTasks();
  return items.find((t) => t.id === id) || null;
}

function isCompletedStatus(status) {
  return status === 'completed';
}

export async function saveTask(patch = {}, {allTasks = null} = {}) {
  const items = allTasks || (await readAllTasks());
  const id = patch.id || newOpsId('tsk');
  const index = items.findIndex((t) => t.id === id);
  const current = index >= 0 ? items[index] : {};
  let next = normalizeTask({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });

  if (!next.title) {
    const error = new Error('Task title is required');
    error.status = 400;
    throw error;
  }
  if (!next.projectId) {
    const error = new Error('Project is required');
    error.status = 400;
    throw error;
  }

  validateDateRange(next.startDate,next.dueDate);
  requireExisting(await readOpsCollection('projects'),next.projectId,'Project');
  const employees = await readOpsCollection('employees');
  next.assigneeIds.forEach(id=>requireExisting(employees,id,'Assignee'));
  for(const key of ['estimatedHours','actualHours']) if(next[key]!=null && (!Number.isFinite(next[key]) || next[key]<0)) invalid('Hours must be a non-negative number');
  if(next.stageId) {
    const stage=(await readOpsCollection('project-stages')).find(s=>s.id===next.stageId);
    if(!stage || stage.projectId!==next.projectId) invalid('The stage must belong to the selected project');
  }
  function visit(dependencyId, seen = new Set()) {
    if(dependencyId===id) invalid('Task dependencies cannot contain a cycle');
    if(seen.has(dependencyId)) return;
    seen.add(dependencyId);
    const dependency=items.find(t=>t.id===dependencyId);
    if(!dependency || dependency.projectId!==next.projectId) invalid('Dependencies must belong to the same project');
    for(const child of dependency.dependencyIds || []) visit(child,seen);
  }
  next.dependencyIds.forEach(dep=>visit(dep));
  if(next.status!=='completed') next.completionDate=null;

  // Enforce dependencies: cannot leave blocked/todo into active work if deps incomplete
  if (next.dependencyIds.length) {
    const incomplete = next.dependencyIds.filter((depId) => {
      const dep = items.find((t) => t.id === depId);
      return !dep || !isCompletedStatus(dep.status);
    });
    if (incomplete.length && ['in_progress', 'in_review', 'completed'].includes(next.status)) {
      next.status = 'blocked';
    } else if (!incomplete.length && next.status === 'blocked') {
      next.status = patch.status && patch.status !== 'blocked' ? patch.status : 'todo';
    } else if (incomplete.length && next.status === 'todo') {
      // keep todo but mark blocked if explicitly requested or auto
      if (patch.autoBlock !== false) next.status = 'blocked';
    }
  }

  if (next.status === 'completed') {
    next.progress = 100;
    if (!next.completionDate) next.completionDate = nowIso().slice(0, 10);
  }

  if (index >= 0) items[index] = next;
  else items.push(next);
  await writeOpsCollection('tasks', items);
  return next;
}

export async function deleteTask(id) {
  const items = await readAllTasks();
  const next = items
    .filter((t) => t.id !== id)
    .map((t) => ({
      ...t,
      dependencyIds: (t.dependencyIds || []).filter((d) => d !== id),
      parentTaskId: t.parentTaskId === id ? null : t.parentTaskId,
    }));
  if (next.length === items.length) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  await writeOpsCollection('tasks', next);
  return {ok: true};
}

export async function updateTaskStatus(id, status) {
  if (!STATUS_SET.has(status)) {
    const error = new Error('Invalid task status');
    error.status = 400;
    throw error;
  }
  return saveTask({id, status});
}

function startOfDay(date = new Date()) {
  return officeToday(date);
}

function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function getMyTasksBoard({assigneeId = null, projectId = null} = {}) {
  const today = startOfDay();
  const weekEnd = addDays(today, 7);
  let items = await listTasks({assigneeId, projectId});
  // Exclude cancelled from boards
  items = items.filter((t) => t.status !== 'cancelled');

  const buckets = {
    overdue: [],
    dueToday: [],
    dueThisWeek: [],
    upcoming: [],
    completed: [],
    blocked: [],
  };

  for (const task of items) {
    if (task.status === 'completed') {
      buckets.completed.push(task);
      continue;
    }
    if (task.status === 'blocked') {
      buckets.blocked.push(task);
      continue;
    }
    const due = task.dueDate;
    if (due && due < today) buckets.overdue.push(task);
    else if (due === today) buckets.dueToday.push(task);
    else if (due && due <= weekEnd) buckets.dueThisWeek.push(task);
    else buckets.upcoming.push(task);
  }

  const kanban = Object.fromEntries(TASK_STATUSES.map((s) => [s.value, []]));
  for (const task of items) {
    if (kanban[task.status]) kanban[task.status].push(task);
  }

  return {buckets, kanban, today, weekEnd, total: items.length};
}

export function enrichTasks(tasks, {projects = [], stages = [], employees = []} = {}) {
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const stageMap = Object.fromEntries(stages.map((s) => [s.id, s]));
  const empMap = Object.fromEntries(employees.map((e) => [e.id, e]));
  return tasks.map((task) => ({
    ...task,
    project: projectMap[task.projectId] || null,
    stage: stageMap[task.stageId] || null,
    assignees: (task.assigneeIds || []).map((id) => empMap[id]).filter(Boolean),
    dependencies: (task.dependencyIds || [])
      .map((id) => tasks.find((t) => t.id === id) || {id, title: 'Missing task'})
      .filter(Boolean),
  }));
}
