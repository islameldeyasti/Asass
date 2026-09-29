/** Local persistence: runtime is authoritative; seed data is read only. */
import {mkdir, readFile, writeFile, rename, unlink} from 'fs/promises';
import {randomUUID} from 'crypto';
import path from 'path';

function collectionPath(directory, name) {
  if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error('Invalid operations collection');
  return path.join(process.cwd(), directory, 'ops', `${name}.json`);
}
async function readJson(filePath) {
  try { return JSON.parse(await readFile(filePath, 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw new Error('Operations data could not be read. Restore the affected data file before continuing.', {cause:error});
  }
}
async function read(name, fallback) {
  const runtime = await readJson(collectionPath('.data',name));
  if (runtime !== undefined) return runtime;
  const seed = await readJson(collectionPath('content',name));
  return seed === undefined ? fallback : seed;
}
async function write(name, data) {
  const file = collectionPath('.data',name);
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    await mkdir(path.dirname(file), {recursive:true});
    await writeFile(temporary, `${JSON.stringify(data,null,2)}\n`, {encoding:'utf8',flag:'wx'});
    await rename(temporary,file);
  } catch(error) {
    await unlink(temporary).catch(()=>{});
    throw new Error('Changes were not saved. Operations storage is unavailable; please retry.', {cause:error});
  }
  return data;
}
export async function readOpsCollection(name, defaultValue = []) {
  const result = await read(name, defaultValue);
  if (!Array.isArray(result)) throw new Error('Invalid operations collection data');
  return result;
}
export async function writeOpsCollection(name, items) {
  if (!Array.isArray(items)) throw new Error('Operations collection must be an array');
  return write(name,items);
}
export async function readOpsDocument(name, defaultValue = null) { return read(name,defaultValue); }
export async function writeOpsDocument(name, doc) { return write(name,doc); }
export function nowIso() { return new Date().toISOString(); }
export function newOpsId(prefix) { return `${prefix}_${randomUUID()}`; }

// Serialize full API read-modify-write operations in this Node process, including across hot reloads.
// Multi-instance deployments still require a transactional database.
const queueKey = Symbol.for('asas.ops.mutation.queue');
export async function withOpsMutation(operation) {
  const previous = globalThis[queueKey] || Promise.resolve();
  let release;
  const turn = new Promise(resolve=>{release=resolve;});
  globalThis[queueKey] = turn;
  await previous;
  try { return await operation(); } finally { release(); }
}
