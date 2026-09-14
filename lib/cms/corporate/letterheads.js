/**
 * Letterhead documents — CMS collection.
 */
import {randomBytes} from 'crypto';
import {
  deleteCollectionItem,
  ensureCollection,
  upsertCollectionItem,
} from '../json-store';
import {writeAudit} from '../audit';
import {emptyLetterhead, LETTERHEAD_TEMPLATES} from './letterhead-model';

export {emptyLetterhead, LETTERHEAD_TEMPLATES};

export async function listLetterheads() {
  return ensureCollection('letterheads', () => []);
}

export async function getLetterhead(id) {
  const items = await listLetterheads();
  return items.find((item) => item.id === id) || null;
}

export async function saveLetterhead(payload, actor = {}) {
  const now = new Date().toISOString();
  const id = payload.id || `lh_${randomBytes(6).toString('hex')}`;
  const existing = payload.id ? await getLetterhead(payload.id) : null;
  const next = emptyLetterhead({
    ...(existing || {}),
    ...payload,
    id,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    createdBy: existing?.createdBy || actor.email || actor.name || '',
  });
  await upsertCollectionItem('letterheads', next, 'id');
  await writeAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: existing ? 'letterhead.update' : 'letterhead.create',
    entity: 'letterhead',
    entityId: id,
    meta: {title: next.title, status: next.status},
  });
  return next;
}

export async function duplicateLetterhead(id, actor = {}) {
  const current = await getLetterhead(id);
  if (!current) {
    const error = new Error('Letterhead not found');
    error.status = 404;
    throw error;
  }
  return saveLetterhead(
    {
      ...current,
      id: '',
      title: `${current.title} (Copy)`,
      status: 'draft',
    },
    actor,
  );
}

export async function deleteLetterhead(id, actor = {}) {
  await deleteCollectionItem('letterheads', id, 'id');
  await writeAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: 'letterhead.delete',
    entity: 'letterhead',
    entityId: id,
  });
  return true;
}
