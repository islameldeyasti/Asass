import {assertNoErpReferences} from '../erp/references.js';
import {uniqueValue, invalid} from './validation';
import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

function normalizeClient(raw = {}) {
  return {
    id: raw.id || newOpsId('ocl'),
    nameEn: String(raw.nameEn || '').trim(),
    nameAr: String(raw.nameAr || '').trim(),
    code: String(raw.code || '').trim(),
    contactName: String(raw.contactName || '').trim(),
    email: String(raw.email || '').trim().toLowerCase(),
    phone: String(raw.phone || '').trim(),
    address: String(raw.address || '').trim(),
    country: String(raw.country || 'UAE').trim(),
    notes: String(raw.notes || '').trim(),
    /** Optional link to website CMS logo client id. */
    websiteClientId: raw.websiteClientId || null,
    active: raw.active !== false,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

export async function listClients({includeInactive = true} = {}) {
  const items = (await readOpsCollection('clients', [])).map(normalizeClient);
  return items
    .filter((c) => includeInactive || c.active)
    .sort((a, b) => a.nameEn.localeCompare(b.nameEn));
}

export async function getClient(id) {
  const items = await listClients({includeInactive: true});
  return items.find((c) => c.id === id) || null;
}

export async function saveClient(patch = {}) {
  const items = await listClients({includeInactive: true});
  const id = patch.id || newOpsId('ocl');
  const index = items.findIndex((c) => c.id === id);
  const current = index >= 0 ? items[index] : {};
  const next = normalizeClient({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });
  if (!next.nameEn) {
    const error = new Error('Client name (EN) is required');
    error.status = 400;
    throw error;
  }
  uniqueValue(items,next,'code','Client code');
  if (index >= 0) items[index] = next;
  else items.push(next);
  await writeOpsCollection('clients', items);
  return next;
}

export async function deleteClient(id) {
  assertNoErpReferences('client',id);
  const items = await listClients({includeInactive: true});
  const next = items.filter((c) => c.id !== id);
  if (next.length === items.length) {
    const error = new Error('Client not found');
    error.status = 404;
    throw error;
  }
  if((await readOpsCollection('projects')).some(r=>r.clientId===id)) invalid('This record is in use. Set it inactive instead of deleting it.',409);
  await writeOpsCollection('clients', next);
  return {ok: true};
}
