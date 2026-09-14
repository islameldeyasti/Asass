import {access, mkdir, readFile, writeFile} from 'fs/promises';
import path from 'path';
import {randomBytes} from 'crypto';
import {hashPassword} from './password';
import {isValidRole, ROLES} from './permissions';

const DATA_DIR = path.join(process.cwd(), '.data', 'cms');
const DATA_FILE = path.join(DATA_DIR, 'users.json');
const SEED_FILE = path.join(process.cwd(), 'content', 'cms', 'users.json');

function nowIso() {
  return new Date().toISOString();
}

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function normalizeUser(raw = {}, {generateId = false} = {}) {
  const id = raw.id || (generateId ? `usr_${randomBytes(8).toString('hex')}` : '');
  const role = isValidRole(raw.role) ? raw.role : ROLES.VIEWER;
  return {
    id,
    email: normalizeEmail(raw.email),
    name: String(raw.name || '').trim() || 'Admin',
    role,
    passwordHash: String(raw.passwordHash || ''),
    active: raw.active !== false,
    createdAt: raw.createdAt || nowIso(),
    updatedAt: raw.updatedAt || nowIso(),
    lastLoginAt: raw.lastLoginAt || null,
  };
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

async function readUsers() {
  let parsed = await readJsonArray(DATA_FILE);
  if (!parsed.length) {
    parsed = await readJsonArray(SEED_FILE);
  }
  return parsed.map((item) => normalizeUser(item));
}

async function writeUsers(users) {
  await ensureStore();
  const payload = `${JSON.stringify(users, null, 2)}\n`;
  await writeFile(DATA_FILE, payload, 'utf8');
  await mkdir(path.dirname(SEED_FILE), {recursive: true});
  await writeFile(SEED_FILE, payload, 'utf8');
  return users;
}

export async function ensureDefaultAdmin() {
  const users = await readUsers();
  if (users.length) return users;

  const email = normalizeEmail(process.env.ADMIN_EMAIL || 'admin@asasengg.ae');
  const password = process.env.ADMIN_PASSWORD || 'asas-admin';
  const passwordHash = await hashPassword(password);
  const admin = normalizeUser(
    {
      email,
      name: 'ASAS Super Admin',
      role: ROLES.SUPER_ADMIN,
      passwordHash,
      active: true,
    },
    {generateId: true},
  );
  await writeUsers([admin]);
  return [admin];
}

export async function listUsers() {
  await ensureDefaultAdmin();
  return readUsers();
}

export async function getUserById(id) {
  const users = await listUsers();
  return users.find((user) => user.id === id) || null;
}

export async function findUserByEmail(email) {
  const users = await listUsers();
  const target = normalizeEmail(email);
  return users.find((user) => user.email === target) || null;
}

export async function createUser({email, name, role, password, active = true}) {
  const users = await listUsers();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    const error = new Error('Email and password are required');
    error.status = 400;
    throw error;
  }
  if (!isValidRole(role)) {
    const error = new Error('Invalid role');
    error.status = 400;
    throw error;
  }
  if (users.some((user) => user.email === normalizedEmail)) {
    const error = new Error('A user with this email already exists');
    error.status = 409;
    throw error;
  }

  const user = normalizeUser(
    {
      email: normalizedEmail,
      name,
      role,
      passwordHash: await hashPassword(password),
      active,
    },
    {generateId: true},
  );
  users.push(user);
  await writeUsers(users);
  return user;
}

export async function updateUser(id, patch = {}) {
  const users = await listUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index < 0) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const current = users[index];
  const nextEmail = patch.email != null ? normalizeEmail(patch.email) : current.email;
  if (patch.email != null && users.some((user) => user.id !== id && user.email === nextEmail)) {
    const error = new Error('A user with this email already exists');
    error.status = 409;
    throw error;
  }
  if (patch.role != null && !isValidRole(patch.role)) {
    const error = new Error('Invalid role');
    error.status = 400;
    throw error;
  }

  const updated = normalizeUser({
    ...current,
    email: nextEmail,
    name: patch.name != null ? patch.name : current.name,
    role: patch.role != null ? patch.role : current.role,
    active: patch.active != null ? Boolean(patch.active) : current.active,
    passwordHash: patch.password ? await hashPassword(patch.password) : current.passwordHash,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
    lastLoginAt: current.lastLoginAt,
  });

  // Keep at least one active super admin
  if (current.role === ROLES.SUPER_ADMIN && (updated.role !== ROLES.SUPER_ADMIN || !updated.active)) {
    const otherSuper = users.filter(
      (user) => user.id !== id && user.role === ROLES.SUPER_ADMIN && user.active,
    );
    if (!otherSuper.length) {
      const error = new Error('At least one active Super Admin is required');
      error.status = 400;
      throw error;
    }
  }

  users[index] = updated;
  await writeUsers(users);
  return updated;
}

export async function deleteUser(id) {
  const users = await listUsers();
  const target = users.find((user) => user.id === id);
  if (!target) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  if (target.role === ROLES.SUPER_ADMIN) {
    const otherSuper = users.filter(
      (user) => user.id !== id && user.role === ROLES.SUPER_ADMIN && user.active,
    );
    if (!otherSuper.length) {
      const error = new Error('Cannot delete the last Super Admin');
      error.status = 400;
      throw error;
    }
  }
  const next = users.filter((user) => user.id !== id);
  await writeUsers(next);
  return true;
}

export async function touchUserLogin(id) {
  const users = await listUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index < 0) return null;
  users[index] = {
    ...users[index],
    lastLoginAt: nowIso(),
    updatedAt: nowIso(),
  };
  await writeUsers(users);
  return users[index];
}

export function toPublicUser(user) {
  if (!user) return null;
  const {passwordHash, ...rest} = user;
  return rest;
}
