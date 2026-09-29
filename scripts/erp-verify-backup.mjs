/** Verify a backup without overwriting the live database. */
import {DatabaseSync} from 'node:sqlite';
const file=process.argv[2];if(!file)throw new Error('Usage: node scripts/erp-verify-backup.mjs /path/to/backup.sqlite');
const db=new DatabaseSync(file,{readOnly:true});
try{
  const integrity=db.prepare('PRAGMA integrity_check').get().integrity_check;
  const foreignKeys=db.prepare('PRAGMA foreign_key_check').all();
  const imbalance=db.prepare('SELECT entry_id FROM ledger_lines GROUP BY entry_id HAVING SUM(debit)<>SUM(credit)').all();
  if(integrity!=='ok'||foreignKeys.length||imbalance.length)throw new Error('Backup validation failed');
  console.log(`Backup valid. ${db.prepare('SELECT COUNT(*) count FROM records').get().count} records; balanced accounting entries; no foreign-key violations.`);
}finally{db.close();}
