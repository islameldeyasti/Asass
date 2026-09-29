import {uniqueValue, invalid} from './validation';
import {OPS_DEPARTMENT_SEED} from './constants';
import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

function normalizeDepartment(raw = {}) {
  return {
    id: raw.id || newOpsId('dept'),
    slug: String(raw.slug || '').trim(),
    nameEn: String(raw.nameEn || '').trim(),
    nameAr: String(raw.nameAr || '').trim(),
    descriptionEn: String(raw.descriptionEn || '').trim(),
    descriptionAr: String(raw.descriptionAr || '').trim(),
    headEmployeeId: raw.headEmployeeId || null,
    active: raw.active !== false,
    order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : 99,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

export async function ensureDepartments() {
  const existing = await readOpsCollection('departments', []);
  if (existing.length) {
    return existing.map(normalizeDepartment).sort((a, b) => a.order - b.order);
  }
  const seeded = OPS_DEPARTMENT_SEED.map((item) =>
    normalizeDepartment({
      ...item,
      id: newOpsId('dept'),
      active: true,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }),
  );
  await writeOpsCollection('departments', seeded);
  return seeded;
}

export async function listDepartments({includeInactive = true} = {}) {
  const items = await ensureDepartments();
  return items
    .filter((d) => includeInactive || d.active)
    .sort((a, b) => a.order - b.order || a.nameEn.localeCompare(b.nameEn));
}

export async function getDepartment(id) {
  const items = await listDepartments({includeInactive: true});
  return items.find((d) => d.id === id || d.slug === id) || null;
}

export async function saveDepartment(patch = {}) {
  const items = await listDepartments({includeInactive: true});
  const id = patch.id || newOpsId('dept');
  const index = items.findIndex((d) => d.id === id);
  const current = index >= 0 ? items[index] : {};
  const next = normalizeDepartment({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });
  if (!next.nameEn) {
    const error = new Error('Department name (EN) is required');
    error.status = 400;
    throw error;
  }
  if (!next.slug) {
    next.slug = next.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  uniqueValue(items,next,'slug','Department slug');
  if (index >= 0) items[index] = next;
  else items.push(next);
  await writeOpsCollection('departments', items);
  return next;
}

export async function deleteDepartment(id) {
  const items = await listDepartments({includeInactive: true});
  const next = items.filter((d) => d.id !== id);
  if (next.length === items.length) {
    const error = new Error('Department not found');
    error.status = 404;
    throw error;
  }
  if((await readOpsCollection('employees')).some(r=>r.departmentId===id)) invalid('This record is in use. Set it inactive instead of deleting it.',409);
  await writeOpsCollection('departments', next);
  return {ok: true};
}
