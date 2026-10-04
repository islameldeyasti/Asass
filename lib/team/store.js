import {mkdir, readFile, writeFile} from 'fs/promises';
import path from 'path';
import {tmpdir} from 'os';
import {normalizeTeamMember, sortTeamMembers, validateTeamMember} from './schema';

const SEED_FILE = path.join(process.cwd(), 'content', 'team', 'members.json');
const LOCAL_DATA_DIR = path.join(process.cwd(), '.data', 'team');
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, 'members.json');
const TMP_DATA_DIR = path.join(tmpdir(), 'asas', 'team');
const TMP_DATA_FILE = path.join(TMP_DATA_DIR, 'members.json');
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), 'public', 'assets', 'asas', 'team');
const TMP_UPLOAD_DIR = path.join(tmpdir(), 'asas', 'team-uploads');

function isServerless() {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}

function teamMemory() {
  if (!globalThis.__asasTeamMembers) {
    globalThis.__asasTeamMembers = {list: null};
  }
  return globalThis.__asasTeamMembers;
}

function dataReadCandidates() {
  return isServerless()
    ? [SEED_FILE, LOCAL_DATA_FILE, TMP_DATA_FILE]
    : [SEED_FILE, TMP_DATA_FILE, LOCAL_DATA_FILE];
}

async function ensureDir(dir) {
  await mkdir(dir, {recursive: true});
}

async function tryWriteFile(filePath, payload) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, payload, 'utf8');
}

async function readJsonArray(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mergeMemberLists(...lists) {
  const map = new Map();
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const member = normalizeTeamMember(item);
      if (member?.id) map.set(member.id, member);
    }
  }
  return sortTeamMembers([...map.values()]);
}

export async function readTeamMembers() {
  const layers = [];
  for (const filePath of dataReadCandidates()) {
    layers.push(await readJsonArray(filePath));
  }
  const memory = teamMemory().list;
  return mergeMemberLists(...layers, memory);
}

async function writeTeamMembers(members) {
  const sorted = sortTeamMembers(members.map((item) => normalizeTeamMember(item)));
  teamMemory().list = sorted;
  const payload = `${JSON.stringify(sorted, null, 2)}\n`;
  const targets = isServerless()
    ? [TMP_DATA_FILE, LOCAL_DATA_FILE, SEED_FILE]
    : [LOCAL_DATA_FILE, SEED_FILE];
  let saved = false;
  let lastError = null;
  for (const filePath of targets) {
    try {
      await tryWriteFile(filePath, payload);
      saved = true;
    } catch (error) {
      lastError = error;
    }
  }
  if (!saved) {
    const error = new Error(
      lastError?.message || 'Could not save the employee card on this host. Retry, or save from a writable environment.',
    );
    error.status = 500;
    throw error;
  }
  try {
    const {invalidateAiKnowledge} = await import('@/lib/ai/knowledge-cache');
    invalidateAiKnowledge();
  } catch {
    // Ask AI cache refresh is optional.
  }
  return sorted;
}

export async function listTeamMembers({includeDrafts = false} = {}) {
  const members = await readTeamMembers();
  if (includeDrafts) return members;
  return members.filter((member) => member.status === 'published');
}

export async function getTeamMemberById(id) {
  const members = await readTeamMembers();
  return members.find((member) => member.id === id) || null;
}

export async function getTeamMemberBySlug(slug, {includeDrafts = false} = {}) {
  const members = await listTeamMembers({includeDrafts});
  return members.find((member) => member.slug === slug) || null;
}

export async function getTeamMemberByPublicId(publicId, {includeDrafts = true} = {}) {
  const raw = String(publicId || '').trim();
  if (!raw) return null;
  const id = raw.toUpperCase();
  const slug = raw.toLowerCase();
  const members = await listTeamMembers({includeDrafts});
  return (
    members.find((member) => {
      const card = member?.digital_card || {};
      const cardId = String(card.publicId || '')
        .trim()
        .toUpperCase();
      return cardId === id || String(member.slug || '').toLowerCase() === slug;
    }) || null
  );
}

/** Allocate a unique card publicId across the team store. */
export async function allocateCardPublicId(preferred = '') {
  const {generatePublicId} = await import('@/lib/cms/corporate/employee-cards');
  const members = await readTeamMembers();
  const used = new Set(
    members
      .map((m) =>
        String(m?.digital_card?.publicId || '')
          .trim()
          .toUpperCase(),
      )
      .filter(Boolean),
  );
  let candidate = String(preferred || '')
    .trim()
    .toUpperCase();
  if (candidate && !used.has(candidate)) return candidate;
  for (let i = 0; i < 40; i += 1) {
    candidate = generatePublicId();
    if (!used.has(candidate)) return candidate;
  }
  return `${generatePublicId()}${Date.now().toString(36).slice(-2).toUpperCase()}`;
}

export async function upsertTeamMemberBySlug(payload) {
  const members = await readTeamMembers();
  const incoming = normalizeTeamMember(payload, {generateId: true});
  const errors = validateTeamMember(incoming);
  if (errors.length) {
    const error = new Error(errors.join(', '));
    error.status = 400;
    throw error;
  }

  const index = members.findIndex((item) => item.slug === incoming.slug);
  if (index >= 0) {
    const current = members[index];
    const updated = normalizeTeamMember(
      {
        ...current,
        ...incoming,
        id: current.id,
        created_at: current.created_at,
      },
      {generateId: false},
    );
    members[index] = updated;
    await writeTeamMembers(members);
    return {member: updated, created: false};
  }

  members.push(incoming);
  await writeTeamMembers(members);
  return {member: incoming, created: true};
}

export async function createTeamMember(payload) {
  const members = await readTeamMembers();
  const member = normalizeTeamMember(payload, {generateId: true});
  const errors = validateTeamMember(member);
  if (errors.length) {
    const error = new Error(errors.join(', '));
    error.status = 400;
    throw error;
  }
  if (members.some((item) => item.slug === member.slug)) {
    const error = new Error('A team member with this slug already exists');
    error.status = 409;
    throw error;
  }
  members.push(member);
  await writeTeamMembers(members);
  return member;
}

export async function updateTeamMember(id, payload) {
  const members = await readTeamMembers();
  const index = members.findIndex((item) => item.id === id);
  if (index < 0) {
    const error = new Error('Team member not found');
    error.status = 404;
    throw error;
  }
  const current = members[index];
  let nextPayload = {...payload};
  if (payload?.digital_card) {
    const {normalizeDigitalCard} = await import('@/lib/cms/corporate/employee-cards');
    const card = normalizeDigitalCard({
      ...(current.digital_card || {}),
      ...payload.digital_card,
    });
    if (!card.publicId) {
      card.publicId = await allocateCardPublicId();
    } else {
      const clash = members.find(
        (item) =>
          item.id !== id &&
          String(item?.digital_card?.publicId || '')
            .trim()
            .toUpperCase() === card.publicId,
      );
      if (clash) {
        const error = new Error('Card public ID already in use');
        error.status = 409;
        throw error;
      }
    }
    nextPayload = {...payload, digital_card: card};
  }
  const member = normalizeTeamMember(
    {
      ...current,
      ...nextPayload,
      id: current.id,
      created_at: current.created_at,
    },
    {generateId: false},
  );
  const errors = validateTeamMember(member);
  if (errors.length) {
    const error = new Error(errors.join(', '));
    error.status = 400;
    throw error;
  }
  if (members.some((item) => item.slug === member.slug && item.id !== id)) {
    const error = new Error('A team member with this slug already exists');
    error.status = 409;
    throw error;
  }
  members[index] = member;
  await writeTeamMembers(members);
  return member;
}

export async function deleteTeamMember(id) {
  const members = await readTeamMembers();
  const next = members.filter((item) => item.id !== id);
  if (next.length === members.length) {
    const error = new Error('Team member not found');
    error.status = 404;
    throw error;
  }
  await writeTeamMembers(next);
  return true;
}

export async function saveTeamUpload(file) {
  if (!file || typeof file === 'string' || !file.arrayBuffer) {
    const error = new Error('Image file is required');
    error.status = 400;
    throw error;
  }
  const max = 4 * 1024 * 1024;
  if (file.size > max) {
    const error = new Error('Image exceeds 4 MB');
    error.status = 400;
    throw error;
  }
  const original = String(file.name || 'portrait.jpg').toLowerCase();
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  if (!allowed.some((ext) => original.endsWith(ext))) {
    const error = new Error('Invalid image type');
    error.status = 400;
    throw error;
  }
  const uploadDir = isServerless() ? TMP_UPLOAD_DIR : LOCAL_UPLOAD_DIR;
  await mkdir(uploadDir, {recursive: true});
  const ext = allowed.find((item) => original.endsWith(item)) || '.jpg';
  const filename = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const abs = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, bytes);
  return `/assets/asas/team/${filename}`;
}

export function getTeamUploadDir() {
  return isServerless() ? TMP_UPLOAD_DIR : LOCAL_UPLOAD_DIR;
}
