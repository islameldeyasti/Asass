import {invalid} from './validation';
import {APPROVAL_STATUSES, APPROVAL_SUBJECT_TYPES} from './constants';
import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

const STATUS_SET = new Set(APPROVAL_STATUSES.map((s) => s.value));
const SUBJECT_SET = new Set(APPROVAL_SUBJECT_TYPES.map((s) => s.value));

function normalizeStep(raw = {}, index = 0) {
  const status = STATUS_SET.has(raw.status) ? raw.status : 'pending';
  return {
    id: raw.id || newOpsId('apst'),
    order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : index + 1,
    title: String(raw.title || `Step ${index + 1}`).trim(),
    approverEmployeeId: raw.approverEmployeeId || null,
    status,
    decision: String(raw.decision || '').trim(),
    comment: String(raw.comment || '').trim(),
    decidedAt: raw.decidedAt || null,
  };
}

function deriveStatus(steps = []) {
  if (!steps.length) return 'pending';
  if (steps.some((s) => s.status === 'rejected')) return 'rejected';
  if (steps.some((s) => s.status === 'returned')) return 'returned';
  if (steps.every((s) => s.status === 'approved')) return 'approved';
  return 'pending';
}

function normalizeApproval(raw = {}) {
  const subjectType = SUBJECT_SET.has(raw.subjectType) ? raw.subjectType : 'document';
  const steps = Array.isArray(raw.steps)
    ? raw.steps.map(normalizeStep).sort((a, b) => a.order - b.order)
    : [];
  return {
    id: raw.id || newOpsId('apr'),
    title: String(raw.title || '').trim(),
    projectId: raw.projectId || null,
    subjectType,
    subjectId: raw.subjectId || null,
    requestedByEmployeeId: raw.requestedByEmployeeId || null,
    requestedByUserId: raw.requestedByUserId || null,
    status: STATUS_SET.has(raw.status) ? raw.status : deriveStatus(steps),
    steps,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

async function readAll() {
  return (await readOpsCollection('approvals', [])).map(normalizeApproval);
}

export async function listApprovals(filters = {}) {
  let items = await readAll();
  if (filters.projectId) items = items.filter((a) => a.projectId === filters.projectId);
  if (filters.status) items = items.filter((a) => a.status === filters.status);
  if (filters.approverEmployeeId) {
    items = items.filter((a) =>
      (a.steps || []).some(
        (s) => s.approverEmployeeId === filters.approverEmployeeId && s.status === 'pending',
      ),
    );
  }
  return items.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function getApproval(id) {
  return (await readAll()).find((a) => a.id === id) || null;
}

export async function saveApproval(patch = {}, {decisionUpdate = false} = {}) {
  const items = await readAll();
  const id = patch.id || newOpsId('apr');
  const index = items.findIndex((a) => a.id === id);
  const current = index >= 0 ? items[index] : {};
  const next = normalizeApproval({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });
  if(!decisionUpdate) {
    if(current.steps?.some(s=>s.status!=='pending')) invalid('A reviewed request cannot be rewritten. Create a new review request.',409);
    next.steps = next.steps.map(s=>({...s,status:'pending',decision:'',comment:'',decidedAt:null}));
  }
  if(!next.steps.length || next.steps.some(s=>!s.approverEmployeeId)) invalid('Assign a reviewer to every approval step');
  if(new Set(next.steps.map(s=>s.id)).size!==next.steps.length) invalid('Approval steps must have unique identifiers');
  next.steps=next.steps.map((s,index)=>({...s,order:index+1}));
  const employees=await readOpsCollection('employees');
  if(next.steps.some(s=>!employees.some(e=>e.id===s.approverEmployeeId))) invalid('A selected reviewer does not exist');
  next.status = deriveStatus(next.steps);
  if (!next.title) {
    const error = new Error('Approval title is required');
    error.status = 400;
    throw error;
  }
  if (index >= 0) items[index] = next;
  else items.push(next);
  await writeOpsCollection('approvals', items);
  return next;
}

export async function decideApprovalStep(approvalId, stepId, {status, comment, decision} = {}) {
  if (!STATUS_SET.has(status) || status === 'pending') {
    const error = new Error('Invalid decision status');
    error.status = 400;
    throw error;
  }
  const approval = await getApproval(approvalId);
  if (!approval) {
    const error = new Error('Approval not found');
    error.status = 404;
    throw error;
  }
  const target=approval.steps.find(s=>s.id===stepId);
  if(!target) invalid('Approval step not found',404);
  if(approval.status!=='pending' || target.status!=='pending') invalid('This review is already decided',409);
  if(approval.steps.some(s=>s.order<target.order && s.status!=='approved')) invalid('Complete the earlier review steps first',409);
  if(status!=='approved' && !String(comment||'').trim()) invalid('Provide a reason for returning or rejecting a review');
  const steps = approval.steps.map((step) =>
    step.id === stepId
      ? {
          ...step,
          status,
          comment: comment || '',
          decision: decision || status,
          decidedAt: nowIso(),
        }
      : step,
  );
  return saveApproval({id: approvalId, steps}, {decisionUpdate:true});
}

export async function deleteApproval(id) {
  const items = await readAll();
  const next = items.filter((a) => a.id !== id);
  if (next.length === items.length) {
    const error = new Error('Approval not found');
    error.status = 404;
    throw error;
  }
  await writeOpsCollection('approvals', next);
  return {ok: true};
}
