import {randomUUID,createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {MODULES, DEFAULT_SETTINGS, permission, actionPermission, actionsFor} from './config.js';
import {database, transaction, settings, getRecord, records, saveRecord, numberFor, audit} from './database.js';
import {fail, fixed, validDate, documentTotals, roundedProduct} from './money.js';

export function allowed(actor, required) {return actor?.role==='super_admin'||(actor?.permissions||[]).includes(required);}
export function authorize(actor, required) {if(!actor?.id)fail('Sign in to continue',401);if(!allowed(actor,required))fail('You do not have permission for this operation',403);}
export function opsRecords(name) {
  for(const directory of ['.data','content']) {
    try {const value=JSON.parse(readFileSync(path.join(process.cwd(),directory,'ops',`${name}.json`),'utf8'));if(!Array.isArray(value))fail('Invalid operations reference data');return value;}
    catch(error){if(error.code!=='ENOENT')throw error;}
  }
  return [];
}
function reference(name,id,label){if(!id)return null;const item=opsRecords(name).find(r=>r.id===id);if(!item)fail(`${label} no longer exists`);return item;}
function knownModule(module){if(!Object.hasOwn(MODULES,module))fail('Unknown ERP module',404);return MODULES[module];}
function bump(record,actor){return {...record,version:record.version+1,updatedAt:new Date().toISOString(),updatedBy:actor.id};}
function checkVersion(record,version){if(!record)fail('Record not found',404);if(Number(version)!==record.version)fail('This record changed. Refresh before trying again.',409);}
function openDate(date,db){validDate(date);if(settings(db).closedThrough&&date<=settings(db).closedThrough)fail('This accounting period is closed',409);}
function documentOutstanding(record,db) {
  if(record.status!=='posted'||!['invoices','bills','expenses','payroll','assets'].includes(record.module))return 0;
  return record.totalMinor-records('payments',db).filter(p=>p.target===record.id&&p.status==='posted').reduce((sum,p)=>sum+p.totalMinor,0);
}
function enrich(record,db){return {...record,outstandingMinor:documentOutstanding(record,db)};}
function validateReferences(record,db){
  const client=reference('clients',record.clientId,'Client');
  const project=reference('projects',record.projectId,'Project');
  reference('employees',record.employeeId,'Employee');reference('employees',record.custodianId,'Custodian');
  if(client&&project?.clientId&&project.clientId!==client.id)fail('The project belongs to a different client');
  if(record.vendorId){const vendor=getRecord(record.vendorId,db);if(vendor?.module!=='vendors'||vendor.status!=='active')fail('Select an active supplier');}
  return {client,project};
}
function normalize(module,input,current,db) {
  const config=knownModule(module);const result={};
  for(const field of config.fields){
    const value=input[field.key];
    if(field.type==='checkbox')result[field.key]=Boolean(value);
    else result[field.key]=String(value??'').trim().slice(0,field.type==='textarea'?5000:500);
    if(field.required&&!result[field.key])fail(`${field.label} is required`);
    if(field.type==='date'&&result[field.key])validDate(result[field.key],field.label);
    if(field.type==='select'&&result[field.key]&&!field.options.includes(result[field.key]))fail(`Invalid ${field.label}`);
    if(field.type==='email'&&result[field.key]&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result[field.key]))fail('Enter a valid email address');
  }
  if(result.date&&result.dueDate&&result.dueDate<result.date)fail('Due date cannot precede the document date');
  validateReferences(result,db);
  if(config.lines)Object.assign(result,documentTotals(input.lines));
  if(config.fields.some(f=>f.key==='amount')){result.totalMinor=fixed(result.amount);if(result.totalMinor<=0)fail('Amount must be greater than zero');}
  if(module==='opportunities'){result.probability=Number(result.probability||0);if(!Number.isFinite(result.probability)||result.probability<0||result.probability>100)fail('Probability must be between 0 and 100');result.stage=result.stage||'qualified';}
  if(module==='time-entries'){
    result.hoursMilli=fixed(result.hours,1000,'Hours');if(result.hoursMilli<=0||result.hoursMilli>24000)fail('Hours must be between 0 and 24');
    result.hourlyCostMinor=fixed(result.hourlyCost);result.totalMinor=roundedProduct(result.hoursMilli,result.hourlyCostMinor,1000);
    const booked=records(module,db).filter(r=>r.id!==current?.id&&r.employeeId===result.employeeId&&r.date===result.date&&!['cancelled','rejected'].includes(r.status)).reduce((n,r)=>n+r.hoursMilli,0);
    if(booked+result.hoursMilli>24000)fail('Total hours for this employee exceed 24 on this date');
  }
  if(module==='payroll'){
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(result.period))fail('Select a valid pay period');
    if(!Array.isArray(input.employees)||!input.employees.length||input.employees.length>500)fail('Add employees to this payroll run');
    const seen=new Set();
    result.employees=input.employees.map(row=>{
      const emp=reference('employees',row.employeeId,'Payroll employee');if(!emp)fail('Select a payroll employee');
      if(seen.has(emp.id))fail('An employee may appear only once in a payroll run');seen.add(emp.id);
      const baseMinor=fixed(row.base),allowanceMinor=fixed(row.allowance),deductionMinor=fixed(row.deduction);
      const netMinor=baseMinor+allowanceMinor-deductionMinor;if(netMinor<=0)fail('Net pay must be positive');
      return {employeeId:emp.id,name:emp.fullNameEn,base:baseMinor/100,allowance:allowanceMinor/100,deduction:deductionMinor/100,baseMinor,allowanceMinor,deductionMinor,netMinor};
    });
    if(records(module,db).some(r=>r.id!==current?.id&&r.period===result.period&&!['cancelled','reversed','rejected'].includes(r.status)&&r.employees.some(e=>seen.has(e.employeeId))))fail('An employee already has payroll for this period',409);
    result.totalMinor=result.employees.reduce((sum,e)=>sum+e.netMinor,0);
    result.grossMinor=result.employees.reduce((sum,e)=>sum+e.baseMinor+e.allowanceMinor,0);
    result.withheldMinor=result.employees.reduce((sum,e)=>sum+e.deductionMinor,0);
  }
  if(module==='assets'){
    result.salvageMinor=fixed(result.salvageValue);result.lifeMonths=Number(result.lifeMonths);
    if(!Number.isInteger(result.lifeMonths)||result.lifeMonths<1||result.lifeMonths>1200)fail('Useful life must be 1–1200 months');
    if(result.salvageMinor>=result.totalMinor)fail('Residual value must be lower than acquisition cost');
    if(records(module,db).some(r=>r.id!==current?.id&&r.serialNumber===result.serialNumber&&r.status!=='cancelled'))fail('Asset tag already exists',409);
  }
  if(module==='journals'){
    if(!Array.isArray(input.lines)||input.lines.length<2||input.lines.length>200)fail('Add at least two journal lines');
    result.lines=input.lines.map(line=>({account:String(line.account||''),debit:fixed(line.debit),credit:fixed(line.credit)}));
    validateJournal(result.lines,db);
    if(result.lines.some(l=>['1100','1600','1690','2000','2100','2300'].includes(l.account)))fail('Use the relevant document module for receivables, payables, payroll and fixed-asset accounts');
    result.totalMinor=result.lines.reduce((s,l)=>s+l.debit,0);
  }
  if(['payments','reconciliation'].includes(module)&&!['1000','1010'].includes(result.bankAccount))fail('Select a cash or bank account');
  if(module==='payments'){
    const target=getRecord(result.target,db);
    if(!target||!['invoices','bills','expenses','payroll','assets'].includes(target.module)||target.status!=='posted')fail('Select a posted document with an outstanding balance');
    if(target.module==='payroll'&&!input.__payrollAccess)fail('Payroll access is required for this payment',403);
    if(result.date<target.date)fail('Payment cannot precede the source document');
    result.targetNumber=target.number;result.direction=target.module==='invoices'?'receipt':'payment';result.projectId=target.projectId||'';
    if(result.totalMinor>documentOutstanding(target,db))fail('Payment exceeds the outstanding balance');
    if(records('payments',db).some(p=>p.id!==current?.id&&p.bankAccount===result.bankAccount&&p.reference===result.reference&&!['cancelled','reversed'].includes(p.status)))fail('This bank reference is already recorded',409);
  }
  if(module==='bills'&&records(module,db).some(r=>r.id!==current?.id&&r.vendorId===result.vendorId&&r.reference===result.reference&&!['cancelled','reversed'].includes(r.status)))fail('This supplier invoice is already recorded',409);
  if(module==='reconciliation'&&records(module,db).some(r=>r.id!==current?.id&&r.bankAccount===result.bankAccount&&r.reference===result.reference&&r.status!=='cancelled'))fail('Statement reference already exists for this account',409);
  if(result.totalMinor!=null && (!Number.isSafeInteger(result.totalMinor)||result.totalMinor>1e12))fail('Document value exceeds the supported limit');
  return result;
}
function validateJournal(lines,db){
  let debit=0,credit=0;
  for(const line of lines){
    if(!db.prepare('SELECT code FROM accounts WHERE code=?').get(line.account))fail('Unknown ledger account');
    if(!Number.isSafeInteger(line.debit)||!Number.isSafeInteger(line.credit)||line.debit<0||line.credit<0||(line.debit>0)===(line.credit>0))fail('Each journal line must have either a debit or a credit');
    debit+=line.debit;credit+=line.credit;
  }
  if(debit<=0||debit!==credit||!Number.isSafeInteger(debit)||debit>1e12)fail('Journal debits and credits must balance');
}
function journal(db,record,lines,date,memo,reversalOf=null){
  openDate(date,db);const effective=lines.filter(l=>l.debit||l.credit);validateJournal(effective,db);
  const id=randomUUID();db.prepare('INSERT INTO ledger(id,source_id,date,memo,reversal_of) VALUES(?,?,?,?,?)').run(id,record.id,date,memo,reversalOf);
  const insert=db.prepare('INSERT INTO ledger_lines(entry_id,account,debit,credit,project_id) VALUES(?,?,?,?,?)');
  for(const line of effective)insert.run(id,line.account,line.debit,line.credit,record.projectId||null);
  return id;
}
const debit=(account,amount)=>({account,debit:amount,credit:0});
const credit=(account,amount)=>({account,debit:0,credit:amount});
function postingLines(record,db){
  const n=record.totalMinor;
  switch(record.module){
    case 'invoices': return [debit('1100',n),credit('4000',record.subtotalMinor),credit('2200',record.taxMinor)];
    case 'bills': return [debit('5000',record.subtotalMinor),debit('1200',record.taxMinor),credit('2000',n)];
    case 'expenses':return [debit('5100',n),credit('2100',n)];
    case 'payroll':return [debit('5200',record.grossMinor),credit('2300',n),credit('2400',record.withheldMinor)];
    case 'assets':return [debit('1600',n),credit('2000',n)];
    case 'payments':{
      const target=getRecord(record.target,db);const control={invoices:'1100',bills:'2000',expenses:'2100',payroll:'2300',assets:'2000'}[target.module];
      return target.module==='invoices'?[debit(record.bankAccount,n),credit(control,n)]:[debit(control,n),credit(record.bankAccount,n)];
    }
    case 'journals':return record.lines;
    default:fail('This document cannot be posted');
  }
}
export function saveDocument(module,input,actor){
  const config=knownModule(module);authorize(actor,permission(config.domain,'write'));
  return transaction(db=>{
    const requestToken=!input.id?String(input.requestId||'').slice(0,100):'';
    const payloadHash=createHash('sha256').update(JSON.stringify({module,input})).digest('hex');
    if(requestToken){
      const previous=db.prepare('SELECT record_id,payload_hash FROM requests WHERE actor=? AND token=?').get(actor.id,requestToken);
      if(previous){if(previous.payload_hash!==payloadHash)fail('This request was already saved with different data. Refresh the register.',409);return enrich(getRecord(previous.record_id,db),db);}
    }
    const current=input.id?getRecord(input.id,db):null;
    if(input.id){checkVersion(current,input.version);if(current.module!==module)fail('Module mismatch');if(!['draft','active','rejected'].includes(current.status))fail('Only draft records can be edited',409);}
    const normalized=normalize(module,{...input,__payrollAccess:allowed(actor,permission('hr','read'))},current,db);
    const now=new Date().toISOString();
    const record={...current,...normalized,id:current?.id||randomUUID(),module,number:current?.number||numberFor(module,db),version:(current?.version||0)+1,status:config.master||module==='opportunities'?'active':'draft',createdAt:current?.createdAt||now,createdBy:current?.createdBy||actor.id,updatedAt:now,updatedBy:actor.id};
    saveRecord(record,db);if(requestToken)db.prepare('INSERT INTO requests(actor,token,payload_hash,record_id) VALUES(?,?,?,?)').run(actor.id,requestToken,payloadHash,record.id);audit(db,actor,current?'update':'create',record.id,{module,number:record.number});return enrich(record,db);
  });
}
export function actOnDocument(module,id,action,input,actor){
  const config=knownModule(module);authorize(actor,permission(config.domain,'read'));authorize(actor,actionPermission(module,action));
  return transaction(db=>{
    let record=getRecord(id,db);checkVersion(record,input.version);if(record.module!==module)fail('Module mismatch');
    if(!actionsFor(module,enrich(record,db)).includes(action)||action==='payment')fail('This action is not available in the current state',409);
    record=bump(record,actor);
    if(['submit','approve','receive','post'].includes(action)){
      const normalized=normalize(module,{...record,lines:module==='journals'?record.lines.map(l=>({...l,debit:l.debit/100,credit:l.credit/100})):record.lines,__payrollAccess:allowed(actor,permission('hr','read'))},record,db);
      Object.assign(record,normalized);
    }
    if(action==='submit')record.status='submitted';
    if(action==='approve'){
      if(record.createdBy===actor.id&&actor.role!=='super_admin')fail('A different authorized reviewer must approve this record',403);
      if(module==='budgets'&&records(module,db).some(r=>r.id!==id&&r.projectId===record.projectId&&r.status==='approved'))fail('An approved budget already exists for this project');
      record.status='approved';record.approvedBy=actor.id;record.approvedAt=new Date().toISOString();
    }
    if(action==='reject'){if(!String(input.reason||'').trim())fail('Enter a rejection reason');record.status='rejected';record.reason=String(input.reason).slice(0,2000);}
    if(action==='receive'){record.status='received';record.receivedAt=new Date().toISOString();record.receivedBy=actor.id;}
    if(action==='archive')record.status='archived';
    if(action==='cancel'){if(record.convertedId)fail('This record has a downstream document and cannot be cancelled');record.status='cancelled';}
    if(['contract','invoice','bill'].includes(action)){
      if(record.convertedId)fail('This document has already been converted',409);
      const targetModule={contract:'contracts',invoice:'invoices',bill:'bills'}[action];
      authorize(actor,permission(MODULES[targetModule].domain,'write'));
      const next={...record,id:randomUUID(),module:targetModule,number:numberFor(targetModule,db),version:1,status:'draft',sourceId:record.id,sourceNumber:record.number,convertedId:null,approvedBy:null,approvedAt:null,createdAt:new Date().toISOString(),createdBy:actor.id};
      if(targetModule==='bills')next.reference='';
      saveRecord(next,db);record.convertedId=next.id;record.convertedModule=targetModule;record.convertedNumber=next.number;
      audit(db,actor,'convert',next.id,{source:record.id,module:targetModule});
    }
    if(action==='post'){
      openDate(record.date,db);
      if(['expenses','payroll'].includes(module)&&record.status!=='approved')fail('Approval is required before posting');
      const refs=validateReferences(record,db);
      record.partySnapshot=refs.client?{name:refs.client.nameEn,address:refs.client.address||'',email:refs.client.email||''}:record.vendorId?{name:getRecord(record.vendorId,db)?.name,address:getRecord(record.vendorId,db)?.address||'',taxNumber:getRecord(record.vendorId,db)?.taxNumber||''}:null;
      const company=settings(db);record.companySnapshot={companyName:company.companyName,address:company.address,taxNumber:company.taxNumber,currency:company.currency};
      record.ledgerId=journal(db,record,postingLines(record,db),record.date,`${record.number} · ${record.title}`);record.status='posted';record.postedBy=actor.id;record.postedAt=new Date().toISOString();
    }
    if(action==='reverse'){
      if(!String(input.reason||'').trim())fail('Enter a reversal reason');
      if(documentOutstanding(record,db)!==record.totalMinor&&module!=='payments'&&module!=='journals')fail('Reverse the linked payments before reversing this document');
      if(module==='payments'&&records('reconciliation',db).some(r=>r.status==='matched'&&r.paymentId===id))fail('Unmatch the bank statement line before reversing this payment');
      if(module==='assets'&&(record.depreciatedMinor||0)>0)fail('An asset with posted depreciation cannot be reversed');
      const reversalDate=validDate(input.date);if(reversalDate<record.date)fail('Reversal date cannot precede the document');
      const lines=db.prepare('SELECT account,debit,credit FROM ledger_lines WHERE entry_id=?').all(record.ledgerId).map(l=>({account:l.account,debit:l.credit,credit:l.debit}));
      record.reversalLedgerId=journal(db,record,lines,reversalDate,`Reversal ${record.number}: ${String(input.reason).slice(0,500)}`,record.ledgerId);record.status='reversed';record.reversalReason=String(input.reason).slice(0,2000);record.reversalDate=reversalDate;
    }
    if(action==='depreciate'){
      const date=validDate(input.date);openDate(date,db);const period=date.slice(0,7);
      if(date<record.date)fail('Depreciation cannot precede acquisition');
      if((record.depreciations||[]).some(d=>d.period===period))fail('Depreciation is already posted for this month',409);
      if((record.depreciations||[]).some(d=>d.date>date))fail('Post depreciation in chronological order');
      const remaining=record.totalMinor-record.salvageMinor-(record.depreciatedMinor||0);if(remaining<=0)fail('This asset is fully depreciated');
      const amount=(record.depreciations||[]).length>=record.lifeMonths-1?remaining:Math.min(remaining,Math.round((record.totalMinor-record.salvageMinor)/record.lifeMonths));if(amount<=0)fail('Monthly depreciation rounds to zero');
      const ledgerId=journal(db,record,[debit('5300',amount),credit('1690',amount)],date,`Depreciation ${record.number} · ${period}`);
      record.depreciatedMinor=(record.depreciatedMinor||0)+amount;record.depreciations=[...(record.depreciations||[]),{period,date,amount,ledgerId}];
    }
    if(action==='match'){
      const payment=getRecord(record.paymentId,db);
      if(payment?.module!=='payments'||payment.status!=='posted')fail('Select a posted payment');
      if(payment.bankAccount!==record.bankAccount||payment.totalMinor!==record.totalMinor||payment.direction!==record.direction)fail('The bank account, direction and amount must match');
      if(records('reconciliation',db).some(r=>r.id!==id&&r.status==='matched'&&r.paymentId===payment.id))fail('This payment is already reconciled',409);
      record.status='matched';record.matchedBy=actor.id;
    }
    if(action==='unmatch')record.status='draft';
    saveRecord(record,db);audit(db,actor,action,id,{module,number:record.number,reason:input.reason||null});return enrich(record,db);
  });
}
export function listDocuments(module,actor){authorize(actor,permission(knownModule(module).domain));const db=database();return records(module,db).map(r=>enrich(r,db));}
export function lookupData(module,actor){
  const config=knownModule(module);authorize(actor,permission(config.domain));const db=database();
  const sources=new Set(config.fields.filter(f=>f.source).map(f=>f.source));if(config.payroll)sources.add('employees');if(module==='payments')sources.add('projects');
  const result={};
  for(const source of sources){
    if(['projects','clients','employees'].includes(source))result[source]=opsRecords(source).map(r=>({id:r.id,label:r.nameEn||r.fullNameEn,clientId:r.clientId||null}));
    if(source==='vendors')result.vendors=records('vendors',db).filter(r=>r.status==='active').map(r=>({id:r.id,label:r.name}));
    if(source==='banks')result.banks=[{id:'1000',label:'1000 · Bank'},{id:'1010',label:'1010 · Cash'}];
    if(source==='openDocuments')result.openDocuments=['invoices','bills','expenses','assets',...(allowed(actor,permission('hr'))?['payroll']:[])].flatMap(m=>records(m,db)).filter(r=>documentOutstanding(r,db)>0).map(r=>({id:r.id,label:`${r.number} · ${r.title}`,outstandingMinor:documentOutstanding(r,db)}));
    if(source==='postedPayments')result.postedPayments=records('payments',db).filter(r=>r.status==='posted'&&!records('reconciliation',db).some(s=>s.status==='matched'&&s.paymentId===r.id)).map(r=>({id:r.id,label:`${r.number} · ${r.title}`}));
  }
  if(config.journal)result.accounts=db.prepare('SELECT * FROM accounts ORDER BY code').all().filter(a=>!['1100','1600','1690','2000','2100','2300'].includes(a.code)).map(a=>({id:a.code,label:`${a.code} · ${a.name}`}));
  return result;
}
export function companySettings(actor){authorize(actor,'erp.settings');return settings();}
export function updateSettings(input,actor){authorize(actor,'erp.settings');return transaction(db=>{
  const current=settings(db);const next={...DEFAULT_SETTINGS};
  for(const key of Object.keys(DEFAULT_SETTINGS))next[key]=String(input[key]??current[key]).trim().slice(0,1000);
  if(!next.companyName)fail('Company name is required');
  if(!/^[A-Z]{3}$/.test(next.currency))fail('Enter an ISO currency code');
  try {new Intl.NumberFormat('en',{style:'currency',currency:next.currency});}catch{fail('Invalid currency');}
  if(next.currency!==current.currency&&db.prepare('SELECT id FROM records LIMIT 1').get())fail('Currency cannot change after documents are created');
  next.defaultTaxRate=fixed(next.defaultTaxRate,100,'Tax rate')/100;if(next.defaultTaxRate>100)fail('Tax rate cannot exceed 100%');
  if(next.closedThrough)validDate(next.closedThrough);
  if(current.closedThrough&&next.closedThrough<current.closedThrough)fail('A closed period cannot be reopened here');
  db.prepare('UPDATE settings SET data=? WHERE id=1').run(JSON.stringify(next));audit(db,actor,'settings',null,{currency:next.currency,closedThrough:next.closedThrough});return next;
});}
export function auditTrail(actor){authorize(actor,'erp.audit');return JSON.parse(JSON.stringify(database().prepare('SELECT * FROM audit ORDER BY id DESC LIMIT 500').all()));}
