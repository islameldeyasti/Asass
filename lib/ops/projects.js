import {assertNoErpReferences} from '../erp/references.js';
import {validateDateRange, uniqueValue, requireExisting, invalid} from './validation';
import {
  MEMBER_ASSIGNMENT_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  PROJECT_TEAM_ROLES,
} from './constants';
import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

const STATUS_SET = new Set(PROJECT_STATUSES.map((s) => s.value));
const PRIORITY_SET = new Set(PROJECT_PRIORITIES.map((s) => s.value));
const ROLE_SET = new Set(PROJECT_TEAM_ROLES.map((r) => r.value));
const MEMBER_STATUS_SET = new Set(MEMBER_ASSIGNMENT_STATUSES.map((s) => s.value));

function clampProgress(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeProject(raw = {}) {
  const status = STATUS_SET.has(raw.status) ? raw.status : 'draft';
  const priority = PRIORITY_SET.has(raw.priority) ? raw.priority : 'normal';
  return {
    id: raw.id || newOpsId('opr'),
    nameEn: String(raw.nameEn || '').trim(),
    nameAr: String(raw.nameAr || '').trim(),
    code: String(raw.code || '').trim(),
    clientId: raw.clientId || null,
    projectType: String(raw.projectType || '').trim(),
    sector: String(raw.sector || '').trim(),
    location: String(raw.location || '').trim(),
    emirate: String(raw.emirate || '').trim(),
    country: String(raw.country || 'UAE').trim(),
    descriptionEn: String(raw.descriptionEn || '').trim(),
    descriptionAr: String(raw.descriptionAr || '').trim(),
    contractValue: raw.contractValue === '' || raw.contractValue == null ? null : Number(raw.contractValue),
    startDate: raw.startDate || null,
    plannedEndDate: raw.plannedEndDate || null,
    actualEndDate: raw.actualEndDate || null,
    projectManagerId: raw.projectManagerId || null,
    projectDirectorId: raw.projectDirectorId || null,
    status,
    priority,
    progress: clampProgress(raw.progress),
    /** Optional link to website portfolio project id/slug. */
    portfolioProjectId: raw.portfolioProjectId || null,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

function normalizeMember(raw = {}) {
  const projectRole = ROLE_SET.has(raw.projectRole) ? raw.projectRole : 'other';
  const status = MEMBER_STATUS_SET.has(raw.status) ? raw.status : 'active';
  return {
    id: raw.id || newOpsId('opm'),
    projectId: raw.projectId || null,
    employeeId: raw.employeeId || null,
    projectRole,
    departmentId: raw.departmentId || null,
    responsibilities: String(raw.responsibilities || '').trim(),
    startDate: raw.startDate || null,
    endDate: raw.endDate || null,
    workloadPercent: clampProgress(raw.workloadPercent ?? 0),
    status,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

export async function listProjects({status = null, clientId = null} = {}) {
  const items = (await readOpsCollection('projects', [])).map(normalizeProject);
  return items
    .filter((p) => (status ? p.status === status : true))
    .filter((p) => (clientId ? p.clientId === clientId : true))
    .sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
}

export async function getProject(id) {
  const items = await listProjects();
  return items.find((p) => p.id === id || p.code === id) || null;
}

export async function saveProject(patch = {}) {
  const items = await listProjects();
  const id = patch.id || newOpsId('opr');
  const index = items.findIndex((p) => p.id === id);
  const current = index >= 0 ? items[index] : {};
  const next = normalizeProject({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });
  if (!next.nameEn) {
    const error = new Error('Project name (EN) is required');
    error.status = 400;
    throw error;
  }
  if (!next.code) {
    next.code = `ASAS-${Date.now().toString(36).toUpperCase()}`;
  }
  validateDateRange(next.startDate, next.plannedEndDate);
  if (next.contractValue != null && (!Number.isFinite(next.contractValue) || next.contractValue < 0)) invalid('Contract value must be a non-negative number');
  uniqueValue(items,next,'code','Project code');
  const [clients, employees] = await Promise.all([readOpsCollection('clients'),readOpsCollection('employees')]);
  requireExisting(clients,next.clientId,'Client');
  requireExisting(employees,next.projectManagerId,'Project manager');
  requireExisting(employees,next.projectDirectorId,'Project director');
  if (index >= 0) items[index] = next;
  else items.push(next);
  await writeOpsCollection('projects', items);
  return next;
}

export async function deleteProject(id) {
  assertNoErpReferences('project',id);
  const items = await listProjects();
  const next = items.filter((p) => p.id !== id);
  if (next.length === items.length) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }
  for (const name of ['tasks','project-stages','documents','approvals','meetings','comments']) {
    if ((await readOpsCollection(name)).some(record=>record.projectId===id)) invalid('This project has delivery records. Change its status instead of deleting it.',409);
  }
  await writeOpsCollection('projects', next);
  const members = await listProjectMembers();
  await writeOpsCollection(
    'project-members',
    members.filter((m) => m.projectId !== id),
  );
  return {ok: true};
}

export async function listProjectMembers({projectId = null, employeeId = null} = {}) {
  const items = (await readOpsCollection('project-members', [])).map(normalizeMember);
  return items
    .filter((m) => (projectId ? m.projectId === projectId : true))
    .filter((m) => (employeeId ? m.employeeId === employeeId : true))
    .sort((a, b) => a.projectRole.localeCompare(b.projectRole));
}

export async function saveProjectMember(patch = {}) {
  const items = await listProjectMembers();
  const id = patch.id || newOpsId('opm');
  const index = items.findIndex((m) => m.id === id);
  const current = index >= 0 ? items[index] : {};
  const next = normalizeMember({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });
  if (!next.projectId || !next.employeeId) {
    const error = new Error('Project and employee are required');
    error.status = 400;
    throw error;
  }
  const duplicate = items.find(
    (m) =>
      m.id !== next.id &&
      m.projectId === next.projectId &&
      m.employeeId === next.employeeId &&
      m.projectRole === next.projectRole &&
      m.status === 'active',
  );
  if (duplicate) {
    const error = new Error('This employee already has that role on the project');
    error.status = 400;
    throw error;
  }
  if (index >= 0) items[index] = next;
  else items.push(next);
  await writeOpsCollection('project-members', items);
  return next;
}

export async function deleteProjectMember(id) {
  const items = await listProjectMembers();
  const next = items.filter((m) => m.id !== id);
  if (next.length === items.length) {
    const error = new Error('Team member not found');
    error.status = 404;
    throw error;
  }
  await writeOpsCollection('project-members', next);
  return {ok: true};
}

export async function getProject360(projectId) {
  const [
    {getClient},
    {listEmployees},
    {listDepartments},
    {listProjectStages, computeStageProgress},
    {listTasks, enrichTasks},
    {listDocuments},
    {listApprovals},
    {listMeetings},
    {listComments, threadComments},
  ] = await Promise.all([
    import('./clients'),
    import('./employees'),
    import('./departments'),
    import('./stages'),
    import('./tasks'),
    import('./documents'),
    import('./approvals'),
    import('./meetings'),
    import('./comments'),
  ]);
  const project = await getProject(projectId);
  if (!project) return null;

  const [
    client,
    members,
    employees,
    departments,
    stages,
    tasks,
    documents,
    approvals,
    meetings,
    comments,
  ] = await Promise.all([
    project.clientId ? getClient(project.clientId) : null,
    listProjectMembers({projectId: project.id}),
    listEmployees(),
    listDepartments({includeInactive: true}),
    listProjectStages(project.id),
    listTasks({projectId: project.id}),
    listDocuments({projectId: project.id}),
    listApprovals({projectId: project.id}),
    listMeetings({projectId: project.id}),
    listComments({projectId: project.id}),
  ]);

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e]));
  const deptMap = Object.fromEntries(departments.map((d) => [d.id, d]));

  const team = members.map((m) => ({
    ...m,
    employee: empMap[m.employeeId] || null,
    department:
      deptMap[m.departmentId] ||
      (empMap[m.employeeId]?.departmentId ? deptMap[empMap[m.employeeId].departmentId] : null),
  }));

  const enrichedTasks = enrichTasks(tasks, {projects: [project], stages, employees});
  const openTasks = enrichedTasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const overdueTasks = openTasks.filter((t) => t.dueDate && t.dueDate < nowIso().slice(0, 10));
  const currentStage =
    stages.find((s) => s.status === 'in_progress') ||
    stages.find((s) => s.status === 'not_started') ||
    stages[stages.length - 1] ||
    null;

  return {
    project,
    client,
    team,
    stages,
    tasks: enrichedTasks,
    documents,
    approvals,
    meetings,
    comments: threadComments(comments),
    projectManager: empMap[project.projectManagerId] || null,
    projectDirector: empMap[project.projectDirectorId] || null,
    currentStage,
    stageProgress: computeStageProgress(stages),
    counts: {
      team: team.filter((m) => m.status === 'active').length,
      stages: stages.length,
      tasks: enrichedTasks.length,
      openTasks: openTasks.length,
      overdueTasks: overdueTasks.length,
      completedTasks: enrichedTasks.filter((t) => t.status === 'completed').length,
      blockedTasks: enrichedTasks.filter((t) => t.status === 'blocked').length,
      documents: documents.length,
      meetings: meetings.length,
      approvals: approvals.length,
      pendingApprovals: approvals.filter((a) => a.status === 'pending').length,
      comments: comments.length,
    },
  };
}
