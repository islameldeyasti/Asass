import {existsSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {erpDatabaseFile} from './database.js';
/** Prevent Operations master-data deletion while financial documents refer to it. */
export function assertNoErpReferences(kind,id){
  const file=erpDatabaseFile();
  if(!existsSync(/* turbopackIgnore: true */ file))return;
  const db=new DatabaseSync(file,{readOnly:true,timeout:5000});
  try{
    const linked=db.prepare('SELECT data FROM records').all().some(row=>{
      const r=JSON.parse(row.data);
      if(kind==='project')return r.projectId===id;
      if(kind==='client')return r.clientId===id;
      if(kind==='employee')return r.employeeId===id||r.custodianId===id||(r.employees||[]).some(e=>e.employeeId===id);
      return false;
    });
    if(linked){const error=new Error('This record is referenced by ERP documents. Set it inactive instead of deleting it.');error.status=409;throw error;}
  }finally{db.close();}
}
