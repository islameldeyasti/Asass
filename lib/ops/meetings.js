import {newOpsId, nowIso, readOpsCollection, writeOpsCollection} from './store';

function normalizeAction(raw = {}) {
  return {
    id: raw.id || newOpsId('mact'),
    text: String(raw.text || '').trim(),
    assigneeEmployeeId: raw.assigneeEmployeeId || null,
    dueDate: raw.dueDate || null,
    taskId: raw.taskId || null,
    done: Boolean(raw.done),
  };
}

function normalizeMeeting(raw = {}) {
  const attendeeIds = Array.isArray(raw.attendeeIds) ? raw.attendeeIds.filter(Boolean) : [];
  const actions = Array.isArray(raw.actions) ? raw.actions.map(normalizeAction).filter((a) => a.text) : [];
  return {
    id: raw.id || newOpsId('mtg'),
    title: String(raw.title || '').trim(),
    projectId: raw.projectId || null,
    date: raw.date || null,
    time: String(raw.time || '').trim(),
    location: String(raw.location || '').trim(),
    onlineLink: String(raw.onlineLink || '').trim(),
    organizerEmployeeId: raw.organizerEmployeeId || null,
    attendeeIds,
    agenda: String(raw.agenda || '').trim(),
    minutes: String(raw.minutes || '').trim(),
    attachmentUrl: String(raw.attachmentUrl || '').trim(),
    actions,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
  };
}

async function readAll() {
  return (await readOpsCollection('meetings', [])).map(normalizeMeeting);
}

export async function listMeetings(filters = {}) {
  let items = await readAll();
  if (filters.projectId) items = items.filter((m) => m.projectId === filters.projectId);
  return items.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

export async function getMeeting(id) {
  return (await readAll()).find((m) => m.id === id) || null;
}

export async function saveMeeting(patch = {}) {
  const items = await readAll();
  const id = patch.id || newOpsId('mtg');
  const index = items.findIndex((m) => m.id === id);
  const current = index >= 0 ? items[index] : {};
  const next = normalizeMeeting({
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
    createdAt: current.createdAt || nowIso(),
  });
  if (!next.title) {
    const error = new Error('Meeting title is required');
    error.status = 400;
    throw error;
  }
  if (index >= 0) items[index] = next;
  else items.push(next);
  await writeOpsCollection('meetings', items);
  return next;
}

export async function deleteMeeting(id) {
  const items = await readAll();
  const next = items.filter((m) => m.id !== id);
  if (next.length === items.length) {
    const error = new Error('Meeting not found');
    error.status = 404;
    throw error;
  }
  await writeOpsCollection('meetings', next);
  return {ok: true};
}

/** Create tasks from meeting actions that do not yet have a taskId. */
export async function createTasksFromMeetingActions(meetingId, {createdByUserId, createdByEmployeeId} = {}) {
  const {saveTask} = await import('./tasks');
  const meeting = await getMeeting(meetingId);
  if (!meeting) {
    const error = new Error('Meeting not found');
    error.status = 404;
    throw error;
  }
  if (!meeting.projectId) {
    const error = new Error('Meeting must belong to a project to create tasks');
    error.status = 400;
    throw error;
  }
  const created = [];
  const actions = [];
  for (const action of meeting.actions || []) {
    if (action.taskId || !action.text) {
      actions.push(action);
      continue;
    }
    const task = await saveTask({
      title: action.text,
      description: `From meeting: ${meeting.title}`,
      projectId: meeting.projectId,
      assigneeIds: action.assigneeEmployeeId ? [action.assigneeEmployeeId] : [],
      dueDate: action.dueDate || null,
      status: 'todo',
      priority: 'normal',
      createdByUserId: createdByUserId || null,
      createdByEmployeeId: createdByEmployeeId || null,
    });
    created.push(task);
    actions.push({...action, taskId: task.id});
  }
  const saved = await saveMeeting({id: meetingId, actions});
  return {meeting: saved, tasks: created};
}
