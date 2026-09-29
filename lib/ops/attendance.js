import {ATTENDANCE_TYPES} from './constants';
import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

const TYPE_SET = new Set(ATTENDANCE_TYPES.map((t) => t.value));

function normalizeAttendance(raw = {}) {
  const type = TYPE_SET.has(raw.type) ? raw.type : 'present';
  return {
    id: raw.id || newOpsId('att'),
    employeeId: raw.employeeId || null,
    date: raw.date || null,
    type,
    checkIn: String(raw.checkIn || '').trim(),
    checkOut: String(raw.checkOut || '').trim(),
    projectId: raw.projectId || null,
    notes: String(raw.notes || '').trim(),
    recordedByUserId: raw.recordedByUserId || null,
    recordedByEmployeeId: raw.recordedByEmployeeId || null,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

async function readAll() {
  return (await readOpsCollection('attendance', [])).map(normalizeAttendance);
}

export async function listAttendance(filters = {}) {
  let items = await readAll();
  if (filters.employeeId) items = items.filter((a) => a.employeeId === filters.employeeId);
  if (filters.date) items = items.filter((a) => a.date === filters.date);
  if (filters.from) items = items.filter((a) => a.date && a.date >= filters.from);
  if (filters.to) items = items.filter((a) => a.date && a.date <= filters.to);
  if (filters.type) items = items.filter((a) => a.type === filters.type);
  return items.sort((a, b) => {
    const d = String(b.date || '').localeCompare(String(a.date || ''));
    if (d) return d;
    return String(b.updatedAt).localeCompare(String(a.updatedAt));
  });
}

export async function getAttendance(id) {
  return (await readAll()).find((a) => a.id === id) || null;
}

export async function saveAttendance(patch = {}) {
  const items = await readAll();
  const id = patch.id || newOpsId('att');
  const index = items.findIndex((a) => a.id === id);
  const current = index >= 0 ? items[index] : {};
  const next = normalizeAttendance({
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
  if (!next.date) {
    const error = new Error('Date is required');
    error.status = 400;
    throw error;
  }
  // One row per employee per day — upsert by natural key when creating
  if (index < 0) {
    const existingIdx = items.findIndex(
      (a) => a.employeeId === next.employeeId && a.date === next.date,
    );
    if (existingIdx >= 0) {
      const merged = normalizeAttendance({
        ...items[existingIdx],
        ...patch,
        id: items[existingIdx].id,
        updatedAt: nowIso(),
        createdAt: items[existingIdx].createdAt,
      });
      items[existingIdx] = merged;
      await writeOpsCollection('attendance', items);
      return merged;
    }
    items.push(next);
  } else {
    items[index] = next;
  }
  await writeOpsCollection('attendance', items);
  return next;
}

export async function deleteAttendance(id) {
  const items = await readAll();
  const next = items.filter((a) => a.id !== id);
  if (next.length === items.length) {
    const error = new Error('Attendance record not found');
    error.status = 404;
    throw error;
  }
  await writeOpsCollection('attendance', next);
  return {ok: true};
}

export function summarizeAttendance(records = []) {
  const byType = Object.fromEntries(ATTENDANCE_TYPES.map((t) => [t.value, 0]));
  for (const row of records) {
    if (byType[row.type] != null) byType[row.type] += 1;
  }
  return {
    total: records.length,
    byType,
  };
}
