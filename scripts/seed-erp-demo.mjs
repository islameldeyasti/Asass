/** Additive, repeatable local demo. Run from Frontend; never overwrites existing records. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {backup} from 'node:sqlite';
import {saveDocument,actOnDocument,opsRecords} from '../lib/erp/engine.js';
import {database,records,getRecord,settings} from '../lib/erp/database.js';
import {MODULES} from '../lib/erp/config.js';
import {financialReports} from '../lib/erp/reports.js';
const root=process.cwd(), dir=path.join(root,'.data/erp');await fs.mkdir(dir,{recursive:true});
const manifestFile=path.join(dir,'demo-v1.json');
let manifest;try{manifest=JSON.parse(await fs.readFile(manifestFile,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const actor={id:'local-demo-seeder-v1',role:'super_admin',permissions:[]};
const db=database();
if(manifest?.completed){console.log('ERP demo already loaded. No records changed.');process.exit(0);}
if(!manifest){
  const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const backupDir=path.join(dir,'backups',`before-demo-${Date.now()}`);await fs.mkdir(backupDir,{recursive:true});await backup(db,path.join(backupDir,'company.sqlite'));
  for(const name of ['clients','projects','employees'])await fs.writeFile(path.join(backupDir,`${name}.json`),JSON.stringify(opsRecords(name),null,2));
  manifest={today,backupDir,completed:false};await fs.writeFile(manifestFile,JSON.stringify(manifest,null,2));
}
const day=offset=>{const d=new Date(manifest.today+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+offset);return d.toISOString().slice(0,10);};
if(settings().closedThrough&&settings().closedThrough>=day(-45))throw new Error('Demo dates overlap a closed accounting period. No documents added; leave the closed period unchanged.');
const now=new Date().toISOString(), notes='DEMO ONLY — fictional training data; no real contract, invoice or payment.';
async function append(name,items){const old=opsRecords(name);const additions=items.filter(r=>!old.some(o=>o.id===r.id));if(!additions.length)return;const target=path.join(root,'.data/ops',`${name}.json`);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target+'.demo.tmp',JSON.stringify([...old,...additions],null,2));await fs.rename(target+'.demo.tmp',target);}
const departments=opsRecords('departments');
await append('employees',['Lina Demo','Omar Demo','Maya Demo','Sami Demo'].map((name,i)=>({photoUrl:'',positionEn:'',positionAr:'',specializations:[],certifications:[],skills:[],teamMemberId:null,lastLoginAt:null,id:`erp_demo_employee_${i}`,employeeCode:`DEMO-E0${i+1}`,fullNameEn:name,fullNameAr:['لينا تجريبي','عمر تجريبي','مايا تجريبي','سامي تجريبي'][i],jobTitleEn:['Project Manager','Architect','MEP Engineer','Quantity Surveyor'][i],jobTitleAr:'موظف تجريبي',departmentId:departments[i%Math.max(1,departments.length)]?.id||null,managerId:i?'erp_demo_employee_0':null,email:`demo${i}@example.test`,phone:'',whatsapp:'',cmsUserId:null,accountActive:false,notes,joiningDate:day(-120),status:'active',createdAt:now,updatedAt:now})));
await append('clients',['Horizon Development','Oasis Education','Cedar Hospitality'].map((name,i)=>({id:`erp_demo_client_${i}`,nameEn:`DEMO · ${name}`,nameAr:['تطوير الأفق — تجريبي','واحة التعليم — تجريبي','ضيافة الأرز — تجريبي'][i],code:`DEMO-C0${i+1}`,contactName:'Demo Contact',email:`client${i}@example.test`,phone:'',address:'Fictional office, UAE',country:'UAE',notes,active:true,websiteClientId:null,createdAt:now,updatedAt:now})));
const projectNames=['Horizon Tower','Oasis School','Cedar Hotel'];
await append('projects',projectNames.map((name,i)=>({id:`erp_demo_project_${i}`,nameEn:`DEMO · ${name}`,nameAr:['برج الأفق — تجريبي','مدرسة الواحة — تجريبي','فندق الأرز — تجريبي'][i],code:`DEMO-P0${i+1}`,clientId:`erp_demo_client_${i}`,projectManagerId:'erp_demo_employee_0',projectDirectorId:null,projectType:['Mixed-use','Education','Hospitality'][i],sector:'Engineering',location:'Demo site',emirate:'Dubai',country:'UAE',descriptionEn:notes,descriptionAr:'بيانات توضيحية وهمية',contractValue:[420000,180000,260000][i],startDate:day(-60),plannedEndDate:day(90+i*30),actualEndDate:null,status:i===2?'on_hold':'active',priority:i===0?'high':'medium',progress:[65,30,15][i],portfolioProjectId:null,createdAt:now,updatedAt:now})));
const refs=i=>({clientId:`erp_demo_client_${i}`,projectId:`erp_demo_project_${i}`});
function create(module,key,data){const marker=`[ERP-DEMO-V1:${key}]`;return records(module).find(r=>r.notes?.includes(marker))||saveDocument(module,{...data,title:data.title?`DEMO · ${data.title}`:undefined,notes:`${notes} ${marker}`},actor);}
function act(doc,action,extra={}){return actOnDocument(doc.module,doc.id,action,{version:doc.version,...extra},actor);}
function approve(doc){if(doc.status==='draft')doc=act(doc,'submit');if(doc.status==='submitted')doc=act(doc,'approve');return doc;}
function post(doc){return doc.status==='draft'||doc.status==='approved'?act(doc,'post'):doc;}
const lines=(description,price)=>[{description:`DEMO · ${description}`,quantity:1,unitPrice:price,taxRate:5}];
function pay(key,target,amount){return post(create('payments',key,{title:`Settlement ${target.number}`,date:day(-2),target:target.id,amount,bankAccount:'1000',reference:`DEMO-${key}`}));}
const vendors=['Survey Partners','BIM Studio','Office Systems'].map((name,i)=>create('vendors',`vendor-${i}`,{name:`DEMO · ${name}`,email:`supplier${i}@example.test`,address:'Fictional supplier address'}));
post(create('journals','opening',{title:'Demo opening capital',date:day(-45),lines:[{account:'1000',debit:500000,credit:0},{account:'3000',debit:0,credit:500000}]}));
for(let i=0;i<3;i++){
  create('opportunities',`opportunity-${i}`,{title:`${projectNames[i]} additional services`,...refs(i),amount:[95000,60000,85000][i],probability:[85,55,25][i],stage:['negotiation','proposal','qualified'][i],expectedDate:day(14+i*7)});
  let quote=approve(create('quotations',`quote-${i}`,{title:`${projectNames[i]} consultancy package`,date:day(-30),dueDate:day(15),...refs(i),lines:lines('Design consultancy',[80000,45000,60000][i])}));
  if(!quote.convertedId)quote=act(quote,'contract');let contract=getRecord(quote.convertedId);contract=approve(contract);if(!contract.convertedId)contract=act(contract,'invoice');let invoice=post(getRecord(contract.convertedId));
  const receipt=pay(`receipt-${i}`,invoice,[30000,47250,20000][i]);
  if(i===0){let match=create('reconciliation','matched-receipt',{title:'Matched customer deposit',date:day(-2),bankAccount:'1000',direction:'receipt',amount:30000,reference:'DEMO-STMT-RECEIPT',paymentId:receipt.id});if(match.status==='draft')act(match,'match');}
  post(create('invoices',`overdue-${i}`,{title:`${projectNames[i]} milestone invoice`,date:day(-40),dueDate:day(-10-i*7),...refs(i),lines:lines('Site supervision milestone',12000+i*5000)}));
  create('invoices',`draft-${i}`,{title:`${projectNames[i]} draft variation`,date:day(0),dueDate:day(30),...refs(i),lines:lines('Variation pending review',8000+i*2500)});
  let po=approve(create('purchase-orders',`po-${i}`,{title:`${projectNames[i]} specialist package`,date:day(-20),dueDate:day(10),vendorId:vendors[i].id,projectId:refs(i).projectId,lines:lines('Specialist engineering services',10000+i*3000)}));if(po.status==='approved')po=act(po,'receive');if(!po.convertedId)po=act(po,'bill');let bill=getRecord(po.convertedId);if(bill.status==='draft')bill=saveDocument('bills',{...bill,reference:`DEMO-SUPPLIER-${i}`},actor);bill=post(bill);pay(`supplier-payment-${i}`,bill,4000);
  approve(create('budgets',`budget-${i}`,{title:`${projectNames[i]} approved baseline`,date:day(-30),projectId:refs(i).projectId,amount:[65000,38000,55000][i],hours:400+i*80}));
}
for(let i=0;i<4;i++)for(let d=0;d<5;d++)approve(create('time-entries',`time-${i}-${d}`,{title:`${['Design coordination','Architectural drawings','MEP coordination','Cost estimation'][i]}`,date:day(-d-3),employeeId:`erp_demo_employee_${i}`,projectId:refs(i%3).projectId,hours:6+d%3,hourlyCost:100+i*25,billable:true}));
for(let i=0;i<4;i++){let expense=create('expenses',`expense-${i}`,{title:['Site travel','Printing and drawings','Site inspection','Pending travel claim'][i],date:day(-5),employeeId:`erp_demo_employee_${i}`,projectId:refs(i%3).projectId,amount:250+i*175,receiptReference:`DEMO-EXP-${i}`});if(i<2){expense=post(approve(expense));if(i===0)pay('expense-reimbursement',expense,250);}else if(expense.status==='draft')act(expense,'submit');}
let payroll=create('payroll','payroll',{title:'Monthly demonstration payroll',date:day(-3),period:day(0).slice(0,7),employees:Array.from({length:4},(_,i)=>({employeeId:`erp_demo_employee_${i}`,base:10000+i*1500,allowance:1500,deduction:250}))});payroll=post(approve(payroll));pay('salary-payment',payroll,payroll.totalMinor/100);
let asset=post(create('assets','workstation',{title:'Engineering workstation',date:day(-30),vendorId:vendors[2].id,projectId:refs(0).projectId,custodianId:'erp_demo_employee_1',serialNumber:'DEMO-ASSET-001',amount:12000,salvageValue:1200,lifeMonths:36}));if(!asset.depreciatedMinor)asset=act(asset,'depreciate',{date:day(-1)});pay('asset-payment',asset,12000);
create('reconciliation','unmatched',{title:'Unmatched statement item for review',date:day(-1),bankAccount:'1000',direction:'payment',amount:125,reference:'DEMO-STMT-UNMATCHED'});
let pending=create('quotations','pending-quote',{title:'Additional landscape design',date:day(0),dueDate:day(21),...refs(0),lines:lines('Landscape design',18000)});if(pending.status==='draft')act(pending,'submit');
const report=financialReports(actor,day(-45),day(0));if(report.trial.reduce((sum,r)=>sum+r.debit-r.credit,0)!==0)throw new Error('Ledger verification failed');
manifest.completed=true;manifest.counts=Object.fromEntries(Object.keys(MODULES).map(m=>[m,records(m).filter(r=>r.createdBy===actor.id).length]));manifest.verifiedAt=new Date().toISOString();await fs.writeFile(manifestFile,JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest,null,2));
