import {assertNoErpReferences} from '../erp/references.js';
import {uniqueValue, requireExisting, invalid} from './validation';
import {EMPLOYEE_STATUSES} from './constants';
import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

const STATUS_VALUES = new Set(EMPLOYEE_STATUSES.map((s) => s.value));

function normalizeEmployee(raw = {}) {
  const status = STATUS_VALUES.has(raw.status) ? raw.status : 'active';
  return {
    id: raw.id || newOpsId('emp'),
    employeeCode: String(raw.employeeCode || '').trim(),
    fullNameEn: String(raw.fullNameEn || '').trim(),
    fullNameAr: String(raw.fullNameAr || '').trim(),
    photoUrl: String(raw.photoUrl || '').trim(),
    jobTitleEn: String(raw.jobTitleEn || '').trim(),
    jobTitleAr: String(raw.jobTitleAr || '').trim(),
    positionEn: String(raw.positionEn || '').trim(),
    positionAr: String(raw.positionAr || '').trim(),
    departmentId: raw.departmentId || null,
    email: String(raw.email || '').trim().toLowerCase(),
    phone: String(raw.phone || '').trim(),
    whatsapp: String(raw.whatsapp || '').trim(),
    joiningDate: raw.joiningDate || null,
    status,
    managerId: raw.managerId || null,
    skills: Array.isArray(raw.skills) ? raw.skills.map(String) : [],
    specializations: Array.isArray(raw.specializations) ? raw.specializations.map(String) : [],
    certifications: Array.isArray(raw.certifications) ? raw.certifications.map(String) : [],
    notes: String(raw.notes || '').trim(),
    /** Link to CMS admin user (lib/cms/users-store) — one identity per staff. */
    cmsUserId: raw.cmsUserId || null,
    /** Optional link to public website team member. */
    teamMemberId: raw.teamMemberId || null,
    accountActive: raw.accountActive !== false,
    lastLoginAt: raw.lastLoginAt || null,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

export async function listEmployees({status = null, departmentId = null} = {}) {
  const items = (await readOpsCollection('employees', [])).map(normalizeEmployee);
  return items
    .filter((e) => (status ? e.status === status : true))
    .filter((e) => (departmentId ? e.departmentId === departmentId : true))
    .sort((a, b) => a.fullNameEn.localeCompare(b.fullNameEn));
}

export async function getEmployee(id) {
  const items = await listEmployees();
  return items.find((e) => e.id === id) || null;
}

export async function getEmployeeByCmsUserId(cmsUserId) {
  if (!cmsUserId) return null;
  const items = await listEmployees();
  return items.find((e) => e.cmsUserId === cmsUserId) || null;
}

export async function saveEmployee(patch = {}) {
  const items = await listEmployees();
  const id = patch.id || newOpsId('emp');
  const index = items.findIndex((e) => e.id === id);
  const current = index >= 0 ? items[index] : {};
  const next = normalizeEmployee({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });

  if (!next.fullNameEn) {
    const error = new Error('Full name (EN) is required');
    error.status = 400;
    throw error;
  }

  uniqueValue(items,next,'employeeCode','Employee code');
  uniqueValue(items,next,'email','Employee email');
  requireExisting(await readOpsCollection('departments'),next.departmentId,'Department');
  requireExisting(items,next.managerId,'Reporting manager');
  const visited = new Set([id]);
  let managerId = next.managerId;
  while(managerId) {
    if(visited.has(managerId)) invalid('Reporting lines cannot contain a cycle');
    visited.add(managerId);
    managerId = items.find(e=>e.id===managerId)?.managerId;
  }
  if (next.cmsUserId) {
    const clash = items.find((e) => e.cmsUserId === next.cmsUserId && e.id !== next.id);
    if (clash) {
      const error = new Error('This user account is already linked to another employee');
      error.status = 400;
      throw error;
    }
  }

  if (index >= 0) items[index] = next;
  else items.push(next);
  await writeOpsCollection('employees', items);
  return next;
}

export async function deleteEmployee(id) {
  assertNoErpReferences('employee',id);
  const items = await listEmployees();
  const next = items.filter((e) => e.id !== id);
  if (next.length === items.length) {
    const error = new Error('Employee not found');
    error.status = 404;
    throw error;
  }
  const references = [['departments','headEmployeeId'],['project-members','employeeId'],['projects','projectManagerId'],['projects','projectDirectorId'],['employees','managerId']];
  for(const [name,key] of references) if((await readOpsCollection(name)).some(r=>r[key]===id)) invalid('This employee is linked to operational records. Change their status instead of deleting them.',409);
  if((await readOpsCollection('tasks')).some(t=>(t.assigneeIds||[]).includes(id))) invalid('This employee has assigned tasks. Reassign them before deleting.',409);
  await writeOpsCollection('employees', next);
  return {ok: true};
}

export async function getOrgChart() {
  const [departments, employees] = await Promise.all([
    import('./departments').then((m) => m.listDepartments({includeInactive: false})),
    listEmployees(),
  ]);
  const active = employees.filter((e) => e.status === 'active' || e.status === 'on_leave');
  const byDept = Object.fromEntries(departments.map((d) => [d.id, []]));
  const unassigned = [];
  for (const emp of active) {
    if (emp.departmentId && byDept[emp.departmentId]) byDept[emp.departmentId].push(emp);
    else unassigned.push(emp);
  }
  return {
    departments: departments.map((d) => ({
      ...d,
      head: active.find((e) => e.id === d.headEmployeeId) || null,
      employees: byDept[d.id] || [],
    })),
    unassigned,
    totals: {
      departments: departments.length,
      employees: active.length,
    },
  };
}
