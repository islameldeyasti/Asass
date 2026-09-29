import {invalid, validateDateRange} from './validation';
import {DEFAULT_STAGE_TEMPLATE_ITEMS, STAGE_STATUSES} from './constants';
import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

const STAGE_STATUS_SET = new Set(STAGE_STATUSES.map((s) => s.value));

function clampProgress(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeTemplateItem(raw = {}, index = 0) {
  return {
    id: raw.id || newOpsId('sti'),
    nameEn: String(raw.nameEn || '').trim(),
    nameAr: String(raw.nameAr || '').trim(),
    descriptionEn: String(raw.descriptionEn || '').trim(),
    order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : index + 1,
    active: raw.active !== false,
    responsibleDepartmentId: raw.responsibleDepartmentId || null,
    responsibleRole: String(raw.responsibleRole || '').trim(),
    requiresApproval: Boolean(raw.requiresApproval),
    requiredDocuments: String(raw.requiredDocuments || '').trim(),
  };
}

function normalizeTemplate(raw = {}) {
  const items = Array.isArray(raw.items)
    ? raw.items.map((item, i) => normalizeTemplateItem(item, i)).sort((a, b) => a.order - b.order)
    : [];
  return {
    id: raw.id || newOpsId('stpl'),
    nameEn: String(raw.nameEn || '').trim() || 'ASAS Standard Workflow',
    nameAr: String(raw.nameAr || '').trim(),
    descriptionEn: String(raw.descriptionEn || '').trim(),
    isDefault: Boolean(raw.isDefault),
    active: raw.active !== false,
    items,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

function normalizeProjectStage(raw = {}) {
  const status = STAGE_STATUS_SET.has(raw.status) ? raw.status : 'not_started';
  return {
    id: raw.id || newOpsId('pstg'),
    projectId: raw.projectId || null,
    templateItemId: raw.templateItemId || null,
    nameEn: String(raw.nameEn || '').trim(),
    nameAr: String(raw.nameAr || '').trim(),
    descriptionEn: String(raw.descriptionEn || '').trim(),
    order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : 99,
    status,
    progress: clampProgress(raw.progress),
    startDate: raw.startDate || null,
    dueDate: raw.dueDate || null,
    completedDate: raw.completedDate || null,
    responsibleEmployeeId: raw.responsibleEmployeeId || null,
    responsibleRole: String(raw.responsibleRole || ''),
    requiresApproval: Boolean(raw.requiresApproval),
    requiredDocuments: String(raw.requiredDocuments || ''),
    responsibleDepartmentId: raw.responsibleDepartmentId || null,
    active: raw.active !== false,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

export async function ensureStageTemplates() {
  const existing = await readOpsCollection('stage-templates', []);
  if (existing.length) {
    return existing.map(normalizeTemplate);
  }
  const seeded = [
    normalizeTemplate({
      id: newOpsId('stpl'),
      nameEn: 'ASAS Standard Engineering Workflow',
      nameAr: 'سير العمل الهندسي القياسي لأساس',
      descriptionEn: 'Default configurable stages for consultancy delivery. Edit or clone anytime.',
      isDefault: true,
      active: true,
      items: DEFAULT_STAGE_TEMPLATE_ITEMS.map((item, index) => ({
        ...item,
        id: newOpsId('sti'),
        order: item.order || index + 1,
        active: true,
      })),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }),
  ];
  await writeOpsCollection('stage-templates', seeded);
  return seeded;
}

export async function listStageTemplates({includeInactive = true} = {}) {
  const items = await ensureStageTemplates();
  return items
    .filter((t) => includeInactive || t.active)
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.nameEn.localeCompare(b.nameEn));
}

export async function getStageTemplate(id) {
  const items = await listStageTemplates({includeInactive: true});
  return items.find((t) => t.id === id) || null;
}

export async function getDefaultStageTemplate() {
  const items = await listStageTemplates({includeInactive: false});
  return items.find((t) => t.isDefault) || items[0] || null;
}

export async function saveStageTemplate(patch = {}) {
  const items = await listStageTemplates({includeInactive: true});
  const id = patch.id || newOpsId('stpl');
  const index = items.findIndex((t) => t.id === id);
  const current = index >= 0 ? items[index] : {};
  let next = normalizeTemplate({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });
  if (!next.nameEn) {
    const error = new Error('Template name is required');
    error.status = 400;
    throw error;
  }
  if (!String(patch.nameEn ?? current.nameEn ?? '').trim()) invalid('Template name is required');
  if (!next.items.length || next.items.some(i=>!i.nameEn)) invalid('Every workflow requires at least one named stage');
  if (new Set(next.items.map(i=>i.id)).size!==next.items.length) invalid('Stage identifiers must be unique');
  if (next.isDefault && !next.active) invalid('The default workflow must be active');
  if (next.isDefault) {
    for (const item of items) {
      if (item.id !== next.id) item.isDefault = false;
    }
  }
  if (index >= 0) items[index] = next;
  else items.push(next);
  await writeOpsCollection('stage-templates', items);
  return next;
}

export async function deleteStageTemplate(id) {
  const items = await listStageTemplates({includeInactive: true});
  const target = items.find((t) => t.id === id);
  if (!target) {
    const error = new Error('Template not found');
    error.status = 404;
    throw error;
  }
  if (target.isDefault) {
    const error = new Error('Cannot delete the default workflow template');
    error.status = 400;
    throw error;
  }
  await writeOpsCollection(
    'stage-templates',
    items.filter((t) => t.id !== id),
  );
  return {ok: true};
}

export async function listProjectStages(projectId) {
  const items = (await readOpsCollection('project-stages', []))
    .map(normalizeProjectStage)
    .filter((s) => s.projectId === projectId)
    .sort((a, b) => a.order - b.order);
  return items;
}

export async function saveProjectStage(patch = {}) {
  const all = (await readOpsCollection('project-stages', [])).map(normalizeProjectStage);
  const id = patch.id || newOpsId('pstg');
  const index = all.findIndex((s) => s.id === id);
  const current = index >= 0 ? all[index] : {};
  const next = normalizeProjectStage({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });
  if (!next.projectId || !next.nameEn) {
    const error = new Error('Project and stage name are required');
    error.status = 400;
    throw error;
  }
  validateDateRange(next.startDate,next.dueDate);
  if (next.status === 'completed' && next.requiresApproval) {
    const approved=(await readOpsCollection('approvals')).some(a=>a.projectId===next.projectId && a.subjectType==='stage' && a.subjectId===next.id && a.status==='approved');
    if(!approved) invalid('This stage requires an approved review before completion',409);
  }
  if (next.status === 'completed' && !next.completedDate) {
    next.completedDate = nowIso().slice(0, 10);
    next.progress = 100;
  }
  if (index >= 0) all[index] = next;
  else all.push(next);
  await writeOpsCollection('project-stages', all);
  return next;
}

export async function deleteProjectStage(id) {
  const all = (await readOpsCollection('project-stages', [])).map(normalizeProjectStage);
  const next = all.filter((s) => s.id !== id);
  if (next.length === all.length) {
    const error = new Error('Stage not found');
    error.status = 404;
    throw error;
  }
  await writeOpsCollection('project-stages', next);
  return {ok: true};
}

/** Clone a template onto a project (skips if stages already exist unless force). */
export async function applyStageTemplateToProject(projectId, templateId = null, {force = false} = {}) {
  if (!projectId) {
    const error = new Error('projectId is required');
    error.status = 400;
    throw error;
  }
  const existing = await listProjectStages(projectId);
  if (existing.length && !force) {
    return existing;
  }
  const template = templateId ? await getStageTemplate(templateId) : await getDefaultStageTemplate();
  if (!template || !template.active) invalid('Select an active workflow template');
  if (!(await readOpsCollection('projects')).some(p=>p.id===projectId)) invalid('Project does not exist');
  if (existing.length && force) {
    const ids = new Set(existing.map(s=>s.id));
    for (const name of ['tasks','documents','approvals']) {
      const linked = (await readOpsCollection(name)).some(r=>ids.has(r.stageId) || (r.subjectType==='stage' && ids.has(r.subjectId)));
      if(linked) invalid('Existing stages have linked delivery records. Edit the stages individually instead.',409);
    }
    if (existing.some(s=>s.status!=='not_started' || s.progress>0)) invalid('This workflow is already in progress. Edit its stages individually.',409);
  }
  const created = template.items.filter(i=>i.active!==false).map(item=>normalizeProjectStage({
    projectId, templateItemId:item.id, nameEn:item.nameEn, nameAr:item.nameAr,
    descriptionEn:item.descriptionEn, order:item.order, responsibleDepartmentId:item.responsibleDepartmentId,
    responsibleRole:item.responsibleRole, requiresApproval:item.requiresApproval,
    requiredDocuments:item.requiredDocuments, status:'not_started', progress:0, active:true,
  }));
  const all = await readOpsCollection('project-stages');
  await writeOpsCollection('project-stages',[...all.filter(s=>s.projectId!==projectId),...created]);
  return created;
}

export function computeStageProgress(stages = []) {
  const active = stages.filter((s) => s.active !== false);
  if (!active.length) return 0;
  const sum = active.reduce((acc, s) => acc + (Number(s.progress) || 0), 0);
  return Math.round(sum / active.length);
}
