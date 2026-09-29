import {LEAVE_STATUSES, LEAVE_TYPES} from './constants';
import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

const TYPE_SET = new Set(LEAVE_TYPES.map((t) => t.value));
const STATUS_SET = new Set(LEAVE_STATUSES.map((s) => s.value));

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const a = new Date(`${start}T00:00:00`);
  const b = new Date(`${end}T00:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime()) || b < a) return 0;
  return Math.floor((b - a) / 86400000) + 1;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeLeave(raw = {}) {
  const leaveType = TYPE_SET.has(raw.leaveType) ? raw.leaveType : 'annual';
  const status = STATUS_SET.has(raw.status) ? raw.status : 'pending';
  const startDate = raw.startDate || null;
  const endDate = raw.endDate || null;
  return {
    id: raw.id || newOpsId('leave'),
    employeeId: raw.employeeId || null,
    leaveType,
    startDate,
    endDate,
    days: Number.isFinite(Number(raw.days)) ? Number(raw.days) : daysBetween(startDate, endDate),
    reason: String(raw.reason || '').trim(),
    status,
    requestedByUserId: raw.requestedByUserId || null,
    decidedByEmployeeId: raw.decidedByEmployeeId || null,
    decidedByUserId: raw.decidedByUserId || null,
    decisionNote: String(raw.decisionNote || '').trim(),
    decidedAt: raw.decidedAt || null,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

async function readAll() {
  return (await readOpsCollection('leave-requests', [])).map(normalizeLeave);
}

export async function listLeaveRequests(filters = {}) {
  let items = await readAll();
  if (filters.employeeId) items = items.filter((r) => r.employeeId === filters.employeeId);
  if (filters.status) items = items.filter((r) => r.status === filters.status);
  if (filters.leaveType) items = items.filter((r) => r.leaveType === filters.leaveType);
  return items.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function getLeaveRequest(id) {
  return (await readAll()).find((r) => r.id === id) || null;
}

export async function saveLeaveRequest(patch = {}) {
  const items = await readAll();
  const id = patch.id || newOpsId('leave');
  const index = items.findIndex((r) => r.id === id);
  const current = index >= 0 ? items[index] : {};
  const next = normalizeLeave({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });
  if (!next.employeeId) {
    const error = new Error('Employee is required');
    error.status = 400;
    throw error;
  }
  if (!next.startDate || !next.endDate) {
    const error = new Error('Start and end dates are required');
    error.status = 400;
    throw error;
  }
  if (next.endDate < next.startDate) {
    const error = new Error('End date must be on or after start date');
    error.status = 400;
    throw error;
  }
  next.days = daysBetween(next.startDate, next.endDate);
  if (index >= 0) {
    if (current.status !== 'pending' && patch.status == null && patch.leaveType) {
      const error = new Error('Only pending leave can be edited');
      error.status = 400;
      throw error;
    }
    items[index] = next;
  } else {
    items.push(next);
  }
  await writeOpsCollection('leave-requests', items);
  return next;
}

export async function decideLeaveRequest(id, {status, decisionNote, decidedByEmployeeId, decidedByUserId} = {}) {
  if (!['approved', 'rejected', 'cancelled'].includes(status)) {
    const error = new Error('Invalid leave decision');
    error.status = 400;
    throw error;
  }
  const current = await getLeaveRequest(id);
  if (!current) {
    const error = new Error('Leave request not found');
    error.status = 404;
    throw error;
  }
  if (current.status !== 'pending' && status !== 'cancelled') {
    const error = new Error('Leave request already decided');
    error.status = 400;
    throw error;
  }
  const saved = await saveLeaveRequest({
    id,
    status,
    decisionNote: decisionNote || '',
    decidedByEmployeeId: decidedByEmployeeId || null,
    decidedByUserId: decidedByUserId || null,
    decidedAt: nowIso(),
  });

  if (status === 'approved' && saved.employeeId) {
    const today = todayIsoDate();
    if (saved.startDate <= today && saved.endDate >= today) {
      const {saveEmployee, getEmployee} = await import('./employees');
      const emp = await getEmployee(saved.employeeId);
      if (emp && emp.status === 'active') {
        await saveEmployee({id: emp.id, status: 'on_leave'});
      }
    }
  }
  return saved;
}

export async function deleteLeaveRequest(id) {
  const items = await readAll();
  const next = items.filter((r) => r.id !== id);
  if (next.length === items.length) {
    const error = new Error('Leave request not found');
    error.status = 404;
    throw error;
  }
  await writeOpsCollection('leave-requests', next);
  return {ok: true};
}

export function leaveBalanceSummary(requests = [], employeeId = null) {
  const scoped = employeeId ? requests.filter((r) => r.employeeId === employeeId) : requests;
  const byType = {};
  for (const type of LEAVE_TYPES) {
    const approved = scoped.filter((r) => r.leaveType === type.value && r.status === 'approved');
    const pending = scoped.filter((r) => r.leaveType === type.value && r.status === 'pending');
    const used = approved.reduce((sum, r) => sum + (r.days || 0), 0);
    byType[type.value] = {
      label: type.label,
      allowance: type.defaultDays,
      used,
      pending: pending.reduce((sum, r) => sum + (r.days || 0), 0),
      remaining: Math.max(0, type.defaultDays - used),
    };
  }
  return byType;
}
