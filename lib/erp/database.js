import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {DEFAULT_ACCOUNTS, DEFAULT_SETTINGS} from './config.js';
const key = Symbol.for('asas.erp.database.v1');
export function erpDatabaseFile() {
  if(process.env.ASAS_ERP_DB) return process.env.ASAS_ERP_DB;
  // Vercel serverless FS is read-only except /tmp
  if(process.env.VERCEL) return path.join(tmpdir(),'asas','erp','company.sqlite');
  return path.join(process.cwd(),'.data','erp','company.sqlite');
}
export function database() {
  const file = erpDatabaseFile();
  if(globalThis[key]?.file===file) return globalThis[key].db;
  if(file!==':memory:') mkdirSync(path.dirname(file),{recursive:true});
  const db = new DatabaseSync(file,{timeout:5000});
  const journal = process.env.VERCEL ? 'DELETE' : 'WAL';
  db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=${journal}; PRAGMA synchronous=FULL;
    CREATE TABLE IF NOT EXISTS settings(id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS accounts(code TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS records(id TEXT PRIMARY KEY, module TEXT NOT NULL, number TEXT NOT NULL UNIQUE, version INTEGER NOT NULL, data TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS records_module ON records(module);
    CREATE TABLE IF NOT EXISTS requests(actor TEXT NOT NULL, token TEXT NOT NULL, payload_hash TEXT NOT NULL, record_id TEXT NOT NULL REFERENCES records(id), PRIMARY KEY(actor,token));
    CREATE TABLE IF NOT EXISTS counters(prefix TEXT PRIMARY KEY, value INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS ledger(id TEXT PRIMARY KEY, source_id TEXT NOT NULL REFERENCES records(id), date TEXT NOT NULL, memo TEXT NOT NULL, reversal_of TEXT UNIQUE REFERENCES ledger(id));
    CREATE TABLE IF NOT EXISTS ledger_lines(id INTEGER PRIMARY KEY, entry_id TEXT NOT NULL REFERENCES ledger(id), account TEXT NOT NULL REFERENCES accounts(code), debit INTEGER NOT NULL CHECK(debit>=0), credit INTEGER NOT NULL CHECK(credit>=0), project_id TEXT, CHECK((debit>0 AND credit=0) OR (credit>0 AND debit=0)));
    CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, at TEXT NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL, record_id TEXT, details TEXT NOT NULL);
    PRAGMA user_version=1;`);
  db.prepare('INSERT OR IGNORE INTO settings(id,data) VALUES(1,?)').run(JSON.stringify(DEFAULT_SETTINGS));
  const insert = db.prepare('INSERT OR IGNORE INTO accounts(code,name,type) VALUES(?,?,?)');
  for(const a of DEFAULT_ACCOUNTS) insert.run(a.code,a.name,a.type);
  globalThis[key]={file,db};return db;
}
export function transaction(fn) {
  const db=database();db.exec('BEGIN IMMEDIATE');
  try {const result=fn(db);db.exec('COMMIT');return result;} catch(error){db.exec('ROLLBACK');throw error;}
}
export function settings(db=database()) {return JSON.parse(db.prepare('SELECT data FROM settings WHERE id=1').get().data);}
export function getRecord(id,db=database()) {const row=db.prepare('SELECT data FROM records WHERE id=?').get(id);return row?JSON.parse(row.data):null;}
export function records(module,db=database()) {return db.prepare('SELECT data FROM records WHERE module=? ORDER BY rowid DESC').all(module).map(r=>JSON.parse(r.data));}
export function saveRecord(record,db=database()) {db.prepare('INSERT INTO records(id,module,number,version,data) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET version=excluded.version,data=excluded.data').run(record.id,record.module,record.number,record.version,JSON.stringify(record));return record;}
export function numberFor(module,db) {const prefix=module.toUpperCase().replace(/[^A-Z]/g,'').slice(0,6);db.prepare('INSERT INTO counters(prefix,value) VALUES(?,1) ON CONFLICT(prefix) DO UPDATE SET value=value+1').run(prefix);return `${prefix}-${String(db.prepare('SELECT value FROM counters WHERE prefix=?').get(prefix).value).padStart(6,'0')}`;}
export function audit(db,actor,action,recordId,details={}) {db.prepare('INSERT INTO audit(at,actor,action,record_id,details) VALUES(?,?,?,?,?)').run(new Date().toISOString(),actor.id,action,recordId||null,JSON.stringify(details));}
