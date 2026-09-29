import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

function normalizeNotification(raw = {}) {
  return {
    id: raw.id || newOpsId('ntf'),
    userId: raw.userId || null,
    employeeId: raw.employeeId || null,
    title: String(raw.title || '').trim(),
    body: String(raw.body || '').trim(),
    href: String(raw.href || '').trim(),
    type: String(raw.type || 'info').trim(),
    readAt: raw.readAt || null,
    createdAt: raw.createdAt || nowIso(),
    meta: raw.meta || null,
  };
}

async function readAll() {
  return (await readOpsCollection('notifications', [])).map(normalizeNotification);
}

export async function listNotifications({userId = null, employeeId = null, unreadOnly = false, limit = 100} = {}) {
  let items = await readAll();
  if (userId) items = items.filter((n) => n.userId === userId);
  if (employeeId) items = items.filter((n) => n.employeeId === employeeId);
  if (unreadOnly) items = items.filter((n) => !n.readAt);
  return items
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, Math.max(1, Math.min(Number(limit) || 100, 300)));
}

export async function createNotification(patch = {}) {
  if (!patch.userId && !patch.employeeId) return null;
  if (!patch.title) return null;
  const items = await readAll();
  const next = normalizeNotification({
    ...patch,
    id: newOpsId('ntf'),
    createdAt: nowIso(),
    readAt: null,
  });
  items.unshift(next);
  await writeOpsCollection('notifications', items.slice(0, 1000));
  return next;
}

export async function createNotifications(list = []) {
  const created = [];
  for (const item of list) {
    const n = await createNotification(item);
    if (n) created.push(n);
  }
  return created;
}

export async function markNotificationRead(id, {userId = null, employeeId = null} = {}) {
  const items = await readAll();
  const index = items.findIndex((n) => n.id === id);
  if (index < 0) {
    const error = new Error('Notification not found');
    error.status = 404;
    throw error;
  }
  const row = items[index];
  if (userId && row.userId && row.userId !== userId) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
  if (employeeId && row.employeeId && row.employeeId !== employeeId && !userId) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
  items[index] = {...row, readAt: row.readAt || nowIso()};
  await writeOpsCollection('notifications', items);
  return items[index];
}

export async function markAllNotificationsRead({userId = null, employeeId = null} = {}) {
  const items = await readAll();
  const now = nowIso();
  let changed = 0;
  const next = items.map((n) => {
    const mine =
      (userId && n.userId === userId) || (employeeId && n.employeeId === employeeId);
    if (mine && !n.readAt) {
      changed += 1;
      return {...n, readAt: now};
    }
    return n;
  });
  if (changed) await writeOpsCollection('notifications', next);
  return {ok: true, updated: changed};
}

/** Notify linked CMS users for a set of employees. */
export async function notifyEmployees(employeeIds = [], payload = {}, employees = []) {
  const set = new Set((employeeIds || []).filter(Boolean));
  const targets = (employees || []).filter((e) => set.has(e.id));
  return createNotifications(
    targets.map((e) => ({
      ...payload,
      employeeId: e.id,
      userId: e.cmsUserId || null,
    })),
  );
}
