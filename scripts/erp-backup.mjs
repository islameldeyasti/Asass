import {DatabaseSync,backup} from 'node:sqlite';
import {existsSync} from 'node:fs';
import path from 'node:path';
const source=process.env.ASAS_ERP_DB||path.join(process.cwd(),'.data/erp/company.sqlite');
const target=process.argv[2];
if(!target)throw new Error('Usage: node scripts/erp-backup.mjs /absolute/path/to/new-backup.sqlite');
if(!path.isAbsolute(target))throw new Error('Use an absolute destination path');
if(existsSync(target))throw new Error('Destination already exists. Choose a new filename.');
const db=new DatabaseSync(source,{readOnly:true});
try{await backup(db,target);const verify=new DatabaseSync(target,{readOnly:true});try{if(verify.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw new Error('Backup integrity check failed');}finally{verify.close();}console.log(`Verified ERP backup: ${target}`);}finally{db.close();}
