import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

const SUBJECT_TYPES = new Set(['project', 'stage', 'task', 'document', 'meeting', 'approval']);

function extractMentions(body = '') {
  const matches = String(body).match(/@([a-zA-Z0-9_.-]+)/g) || [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
}

function normalizeComment(raw = {}) {
  const subjectType = SUBJECT_TYPES.has(raw.subjectType) ? raw.subjectType : 'project';
  return {
    id: raw.id || newOpsId('cmt'),
    projectId: raw.projectId || null,
    subjectType,
    subjectId: raw.subjectId || null,
    parentId: raw.parentId || null,
    body: String(raw.body || '').trim(),
    authorEmployeeId: raw.authorEmployeeId || null,
    authorUserId: raw.authorUserId || null,
    mentionKeys: Array.isArray(raw.mentionKeys) ? raw.mentionKeys : extractMentions(raw.body),
    attachmentUrl: String(raw.attachmentUrl || '').trim(),
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

async function readAll() {
  return (await readOpsCollection('comments', [])).map(normalizeComment);
}

export async function listComments(filters = {}) {
  let items = await readAll();
  if (filters.projectId) items = items.filter((c) => c.projectId === filters.projectId);
  if (filters.subjectType) items = items.filter((c) => c.subjectType === filters.subjectType);
  if (filters.subjectId) items = items.filter((c) => c.subjectId === filters.subjectId);
  return items.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}

export async function saveComment(patch = {}) {
  const items = await readAll();
  const id = patch.id || newOpsId('cmt');
  const index = items.findIndex((c) => c.id === id);
  const current = index >= 0 ? items[index] : {};
  const next = normalizeComment({
    ...current,
    ...patch,
    id,
    mentionKeys: extractMentions(patch.body ?? current.body),
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });
  if (!next.body) {
    const error = new Error('Comment body is required');
    error.status = 400;
    throw error;
  }
  if (!next.projectId) {
    const error = new Error('projectId is required');
    error.status = 400;
    throw error;
  }
  if (index >= 0) items[index] = next;
  else items.push(next);
  await writeOpsCollection('comments', items);
  return next;
}

export async function deleteComment(id) {
  const items = await readAll();
  const next = items.filter((c) => c.id !== id && c.parentId !== id);
  if (next.length >= items.length) {
    const error = new Error('Comment not found');
    error.status = 404;
    throw error;
  }
  await writeOpsCollection('comments', next);
  return {ok: true};
}

export function threadComments(comments = []) {
  const roots = comments.filter((c) => !c.parentId);
  return roots.map((root) => ({
    ...root,
    replies: comments.filter((c) => c.parentId === root.id),
  }));
}
