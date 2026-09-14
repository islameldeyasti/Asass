import {mkdir, readFile, writeFile} from 'fs/promises';
import path from 'path';
import {randomBytes} from 'crypto';

const DATA_DIR = path.join(process.cwd(), '.data', 'cms');
const DATA_FILE = path.join(DATA_DIR, 'audit.json');
const MAX_ENTRIES = 500;

async function readLog() {
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeAudit({actorId, actorEmail, action, entity, entityId, meta}) {
  try {
    await mkdir(DATA_DIR, {recursive: true});
    const entries = await readLog();
    entries.unshift({
      id: `aud_${randomBytes(6).toString('hex')}`,
      at: new Date().toISOString(),
      actorId: actorId || null,
      actorEmail: actorEmail || null,
      action,
      entity: entity || null,
      entityId: entityId || null,
      meta: meta || null,
    });
    await writeFile(DATA_FILE, `${JSON.stringify(entries.slice(0, MAX_ENTRIES), null, 2)}\n`, 'utf8');
  } catch {
    // Audit must never break admin flows (e.g. read-only FS on Vercel).
  }
}

export async function listAudit({limit = 50} = {}) {
  const entries = await readLog();
  return entries.slice(0, limit);
}
