import {access, mkdir, readFile, writeFile} from 'fs/promises';
import path from 'path';
import {normalizeTeamMember, sortTeamMembers, validateTeamMember} from './schema';

const DATA_DIR = path.join(process.cwd(), '.data', 'team');
const DATA_FILE = path.join(DATA_DIR, 'members.json');
const SEED_FILE = path.join(process.cwd(), 'content', 'team', 'members.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'assets', 'asas', 'team');

async function ensureStore() {
  await mkdir(DATA_DIR, {recursive: true});
  try {
    await access(DATA_FILE);
  } catch {
    let seed = '[]';
    try {
      seed = await readFile(SEED_FILE, 'utf8');
    } catch {
      seed = '[]';
    }
    await writeFile(DATA_FILE, seed, 'utf8');
  }
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

export async function readTeamMembers() {
  // Vercel's runtime filesystem is read-only. Read the optional local store
  // when it exists, then fall back to the committed seed used in production.
  let parsed = await readJsonArray(DATA_FILE);
  // If the optional runtime store is empty, fall back to committed content seed.
  if (!parsed.length) {
    parsed = await readJsonArray(SEED_FILE);
  }
  return sortTeamMembers(parsed.map((item) => normalizeTeamMember(item)));
}

async function writeTeamMembers(members) {
  await ensureStore();
  const sorted = sortTeamMembers(members.map((item) => normalizeTeamMember(item)));
  const payload = `${JSON.stringify(sorted, null, 2)}\n`;
  await writeFile(DATA_FILE, payload, 'utf8');
  // Dual-write so homepage/content survives .data resets and stays reviewable in git.
  await mkdir(path.dirname(SEED_FILE), {recursive: true});
  await writeFile(SEED_FILE, payload, 'utf8');
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
  const id = String(publicId || '')
    .trim()
    .toUpperCase();
  if (!id) return null;
  const members = await listTeamMembers({includeDrafts});
  return (
    members.find((member) => {
      const card = member?.digital_card || {};
      return String(card.publicId || '')
        .trim()
        .toUpperCase() === id;
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
  await mkdir(UPLOAD_DIR, {recursive: true});
  const ext = allowed.find((item) => original.endsWith(item)) || '.jpg';
  const filename = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const abs = path.join(UPLOAD_DIR, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, bytes);
  return `/assets/asas/team/${filename}`;
}

export function getTeamUploadDir() {
  return UPLOAD_DIR;
}
