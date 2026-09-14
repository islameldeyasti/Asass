import {mkdir, readFile, writeFile} from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data', 'cms');
const SEED_DIR = path.join(process.cwd(), 'content', 'cms');

function dataPath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function seedPath(name) {
  return path.join(SEED_DIR, `${name}.json`);
}

function isEmptyValue(value) {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

async function readJson(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Read a JSON document. Prefers runtime `.data/cms`, then committed `content/cms`.
 * Returns `defaultValue` when both are missing/empty.
 */
export async function readDocument(name, defaultValue = null) {
  let parsed = await readJson(dataPath(name));
  if (isEmptyValue(parsed)) {
    parsed = await readJson(seedPath(name));
  }
  if (isEmptyValue(parsed)) return defaultValue;
  return parsed;
}

/**
 * Dual-write a JSON document to `.data/cms` and `content/cms`.
 * Never throws on read-only filesystem failures (e.g. Vercel prod).
 */
export async function writeDocument(name, value) {
  const payload = `${JSON.stringify(value, null, 2)}\n`;
  try {
    await mkdir(DATA_DIR, {recursive: true});
    await writeFile(dataPath(name), payload, 'utf8');
  } catch {
    // Runtime FS may be read-only in production.
  }
  try {
    await mkdir(SEED_DIR, {recursive: true});
    await writeFile(seedPath(name), payload, 'utf8');
  } catch {
    // Seed dual-write may also fail on read-only deploys.
  }
  return value;
}

export async function readCollection(name) {
  const value = await readDocument(name, []);
  return Array.isArray(value) ? value : [];
}

export async function writeCollection(name, items) {
  const list = Array.isArray(items) ? items : [];
  await writeDocument(name, list);
  return list;
}

export async function upsertCollectionItem(name, item, idKey = 'id') {
  const items = await readCollection(name);
  const key = item?.[idKey];
  if (key == null) {
    const error = new Error(`Item is missing ${idKey}`);
    error.status = 400;
    throw error;
  }
  const index = items.findIndex((entry) => entry?.[idKey] === key);
  if (index >= 0) {
    items[index] = {...items[index], ...item};
  } else {
    items.push(item);
  }
  await writeCollection(name, items);
  return items.find((entry) => entry?.[idKey] === key);
}

export async function deleteCollectionItem(name, id, idKey = 'id') {
  const items = await readCollection(name);
  const next = items.filter((entry) => entry?.[idKey] !== id);
  if (next.length === items.length) {
    const error = new Error('Item not found');
    error.status = 404;
    throw error;
  }
  await writeCollection(name, next);
  return true;
}

/**
 * If the document is missing/empty, call `factory`, write the result, and return it.
 */
export async function ensureDocument(name, factory) {
  const existing = await readDocument(name, null);
  if (!isEmptyValue(existing)) return existing;
  const created = typeof factory === 'function' ? await factory() : factory;
  const value = created == null ? {} : created;
  await writeDocument(name, value);
  return value;
}

/**
 * If the collection is missing/empty, call `factory`, write the result, and return it.
 */
export async function ensureCollection(name, factory) {
  const existing = await readCollection(name);
  if (existing.length) return existing;
  const created = typeof factory === 'function' ? await factory() : factory;
  const items = Array.isArray(created) ? created : [];
  await writeCollection(name, items);
  return items;
}

export {DATA_DIR, SEED_DIR};
