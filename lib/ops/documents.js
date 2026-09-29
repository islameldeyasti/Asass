import {DOCUMENT_CONFIDENTIALITY, DOCUMENT_STATUSES} from './constants';
import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

const STATUS_SET = new Set(DOCUMENT_STATUSES.map((s) => s.value));
const CONF_SET = new Set(DOCUMENT_CONFIDENTIALITY.map((s) => s.value));

function normalizeVersion(raw = {}, index = 0) {
  return {
    id: raw.id || newOpsId('dver'),
    revision: String(raw.revision || `REV ${String(index + 1).padStart(2, '0')}`).trim(),
    version: Number.isFinite(Number(raw.version)) ? Number(raw.version) : index + 1,
    fileUrl: String(raw.fileUrl || '').trim(),
    fileName: String(raw.fileName || '').trim(),
    notes: String(raw.notes || '').trim(),
    uploadedByEmployeeId: raw.uploadedByEmployeeId || null,
    uploadedByUserId: raw.uploadedByUserId || null,
    createdAt: raw.createdAt || nowIso(),
    isLatest: Boolean(raw.isLatest),
  };
}

function normalizeDocument(raw = {}) {
  const status = STATUS_SET.has(raw.status) ? raw.status : 'draft';
  const confidentiality = CONF_SET.has(raw.confidentiality) ? raw.confidentiality : 'internal';
  let versions = Array.isArray(raw.versions) ? raw.versions.map(normalizeVersion) : [];
  if (!versions.length && raw.fileUrl) {
    versions = [
      normalizeVersion({
        fileUrl: raw.fileUrl,
        fileName: raw.fileName,
        revision: raw.revision || 'REV 01',
        version: 1,
        isLatest: true,
        uploadedByEmployeeId: raw.uploadedByEmployeeId,
        uploadedByUserId: raw.uploadedByUserId,
      }),
    ];
  }
  versions = versions
    .sort((a, b) => a.version - b.version)
    .map((v, i, arr) => ({...v, isLatest: i === arr.length - 1}));
  const latest = versions[versions.length - 1] || null;

  return {
    id: raw.id || newOpsId('odoc'),
    name: String(raw.name || '').trim(),
    type: String(raw.type || '').trim(),
    description: String(raw.description || '').trim(),
    status,
    confidentiality,
    projectId: raw.projectId || null,
    stageId: raw.stageId || null,
    taskId: raw.taskId || null,
    clientId: raw.clientId || null,
    employeeId: raw.employeeId || null,
    versions,
    latestRevision: latest?.revision || null,
    latestFileUrl: latest?.fileUrl || '',
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

async function readAll() {
  return (await readOpsCollection('documents', [])).map(normalizeDocument);
}

export async function listDocuments(filters = {}) {
  let items = await readAll();
  if (filters.projectId) items = items.filter((d) => d.projectId === filters.projectId);
  if (filters.stageId) items = items.filter((d) => d.stageId === filters.stageId);
  if (filters.taskId) items = items.filter((d) => d.taskId === filters.taskId);
  if (filters.status) items = items.filter((d) => d.status === filters.status);
  return items.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function getDocument(id) {
  return (await readAll()).find((d) => d.id === id) || null;
}

export async function saveDocument(patch = {}) {
  const items = await readAll();
  const id = patch.id || newOpsId('odoc');
  const index = items.findIndex((d) => d.id === id);
  const current = index >= 0 ? items[index] : {};
  const next = normalizeDocument({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });
  if (!next.name) {
    const error = new Error('Document name is required');
    error.status = 400;
    throw error;
  }
  if (index >= 0) items[index] = next;
  else items.push(next);
  await writeOpsCollection('documents', items);
  return next;
}

/** Add a new revision without overwriting previous versions. */
export async function addDocumentRevision(documentId, revisionPatch = {}) {
  const doc = await getDocument(documentId);
  if (!doc) {
    const error = new Error('Document not found');
    error.status = 404;
    throw error;
  }
  const nextVersion = (doc.versions?.length || 0) + 1;
  const revision =
    revisionPatch.revision || `REV ${String(nextVersion).padStart(2, '0')}`;
  const versions = [
    ...(doc.versions || []).map((v) => ({...v, isLatest: false})),
    normalizeVersion({
      ...revisionPatch,
      revision,
      version: nextVersion,
      isLatest: true,
      createdAt: nowIso(),
    }),
  ];
  return saveDocument({
    id: documentId,
    versions,
    status: revisionPatch.status || doc.status,
  });
}

export async function deleteDocument(id) {
  const items = await readAll();
  const next = items.filter((d) => d.id !== id);
  if (next.length === items.length) {
    const error = new Error('Document not found');
    error.status = 404;
    throw error;
  }
  await writeOpsCollection('documents', next);
  return {ok: true};
}
