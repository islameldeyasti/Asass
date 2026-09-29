export const FIELD = (key, label, type = 'text', extra = {}) => ({key, label, type, ...extra});
const title = FIELD('title', 'Description / title', 'text', {required: true});
const date = FIELD('date', 'Document date', 'date', {required: true});
const due = FIELD('dueDate', 'Due date', 'date');
const project = FIELD('projectId', 'Project', 'reference', {source: 'projects'});
const client = FIELD('clientId', 'Client', 'reference', {source: 'clients', required: true});
const vendor = FIELD('vendorId', 'Supplier', 'reference', {source: 'vendors', required: true});
const employee = FIELD('employeeId', 'Employee', 'reference', {source: 'employees', required: true});
const note = FIELD('notes', 'Notes', 'textarea');
const amount = FIELD('amount', 'Amount', 'money', {required: true});
export const MODULES = {
  opportunities: {label: 'Sales pipeline', singular: 'Opportunity', domain: 'sales', description: 'Track qualified opportunities and their next commercial step.', fields: [title, client, project, amount, FIELD('probability', 'Probability %', 'number'), FIELD('expectedDate', 'Expected close', 'date'), FIELD('stage', 'Sales stage', 'select', {options: ['qualified','proposal','negotiation','won','lost']}), note], actions: ['archive']},
  quotations: {label: 'Quotations', singular: 'Quotation', domain: 'sales', description: 'Build priced proposals and convert accepted work into contracts.', lines: true, fields: [title, date, due, client, project, note], actions: ['submit','approve','reject','contract','cancel']},
  contracts: {label: 'Contracts', singular: 'Contract', domain: 'sales', description: 'Agreed scope, commercial value and linked project delivery.', lines: true, fields: [title, date, due, client, project, FIELD('reference', 'Signed contract reference'), note], actions: ['submit','approve','reject','invoice','cancel']},
  vendors: {label: 'Suppliers', singular: 'Supplier', domain: 'purchase', description: 'Supplier records for purchasing and accounts payable.', master: true, fields: [FIELD('name','Supplier name','text',{required:true}), FIELD('email','Email','email'),FIELD('phone','Phone'),FIELD('taxNumber','Tax registration number'),FIELD('address','Address','textarea'),note], actions: ['archive']},
  'purchase-orders': {label: 'Purchase orders', singular: 'Purchase order', domain: 'purchase', description: 'Approve commitments, confirm receipt and create supplier bills.', lines: true, fields: [title,date,due,vendor,project,note], actions: ['submit','approve','reject','receive','bill','cancel']},
  invoices: {label: 'Customer invoices', singular: 'Invoice', domain: 'finance', description: 'Post invoices to receivables and track outstanding balances.', lines: true, financial: true, fields: [title,date,due,client,project,FIELD('reference','Contract / client reference'),note], actions: ['post','payment','reverse','cancel']},
  bills: {label: 'Supplier bills', singular: 'Bill', domain: 'finance', description: 'Record supplier invoices and recognize project delivery costs.', lines: true, financial: true, fields: [title,date,due,vendor,project,FIELD('reference','Supplier invoice number','text',{required:true}),note], actions: ['post','payment','reverse','cancel']},
  expenses: {label: 'Expense claims', singular: 'Expense claim', domain: 'finance', description: 'Review reimbursable employee expenses before posting.', financial: true, fields: [title,date,employee,project,amount,FIELD('receiptReference','Receipt reference','text',{required:true}),note], actions: ['submit','approve','reject','post','payment','reverse','cancel']},
  payments: {label: 'Receipts & payments', singular: 'Payment', domain: 'finance', description: 'Record a receipt or payment against a posted document. No bank transfer is sent.', financial: true, fields: [title,date,FIELD('target','Open document','reference',{source:'openDocuments',required:true}),amount,FIELD('bankAccount','Cash / bank account','reference',{source:'banks',required:true}),FIELD('reference','Bank reference','text',{required:true}),note], actions: ['post','reverse','cancel']},
  'time-entries': {label: 'Timesheets', singular: 'Time entry', domain: 'time', description: 'Approve project hours and measure internal delivery effort.', fields: [title,date,employee,{...project,required:true},FIELD('hours','Hours','number',{required:true}),FIELD('hourlyCost','Internal cost per hour','money',{required:true}),FIELD('billable','Billable','checkbox'),note], actions: ['submit','approve','reject','cancel']},
  payroll: {label: 'Payroll runs', singular: 'Payroll run', domain: 'hr', description: 'Review entered salary components and post payroll liabilities.', payroll: true, financial: true, fields: [title,date,FIELD('period','Pay period','month',{required:true}),note], actions: ['submit','approve','reject','post','payment','reverse','cancel']},
  assets: {label: 'Fixed assets', singular: 'Asset', domain: 'assets', description: 'Capitalize assets, track custody and record monthly straight-line depreciation.', financial: true, fields: [title,date,vendor,project,FIELD('custodianId','Custodian','reference',{source:'employees'}),FIELD('serialNumber','Serial / asset tag','text',{required:true}),amount,FIELD('salvageValue','Residual value','money'),FIELD('lifeMonths','Useful life in months','number',{required:true}),note], actions: ['post','depreciate','payment','reverse','cancel']},
  budgets: {label: 'Project budgets', singular: 'Budget', domain: 'finance', description: 'Set a project cost baseline and compare recorded delivery costs.', fields: [title,date,{...project,required:true},amount,FIELD('hours','Planned hours','number'),note], actions: ['submit','approve','reject','cancel']},
  journals: {label: 'Journal entries', singular: 'Journal', domain: 'finance', description: 'Balanced manual and automatically generated accounting entries.', journal: true, financial: true, fields: [title,date,project,note], actions: ['post','reverse','cancel']},
  reconciliation: {label: 'Bank reconciliation', singular: 'Statement line', domain: 'finance', description: 'Record statement lines and match them to posted receipts or payments.', fields: [title,date,FIELD('bankAccount','Bank account','reference',{source:'banks',required:true}),FIELD('direction','Direction','select',{options:['receipt','payment'],required:true}),amount,FIELD('reference','Statement reference','text',{required:true}),FIELD('paymentId','Recorded payment','reference',{source:'postedPayments'}),note], actions: ['match','unmatch','cancel']},
};
export const DOMAINS = ['sales','purchase','finance','time','hr','assets'];
export const DEFAULT_ACCOUNTS = [
  ['1000','Bank','asset'],['1010','Cash','asset'],['1100','Accounts receivable','asset'],['1200','Input tax','asset'],
  ['1600','Fixed assets','asset'],['1690','Accumulated depreciation','asset'],['2000','Accounts payable','liability'],
  ['2100','Employee reimbursements payable','liability'],['2200','Output tax','liability'],['2300','Payroll payable','liability'],
  ['2400','Payroll withholdings payable','liability'],['3000','Opening equity','equity'],['4000','Engineering service revenue','income'],['5000','Project procurement costs','expense'],
  ['5100','Employee expenses','expense'],['5200','Payroll expense','expense'],['5300','Depreciation expense','expense'],
].map(([code,name,type])=>({code,name,type}));
export const DEFAULT_SETTINGS = {companyName:'ASAS Engineering',address:'',taxNumber:'',currency:'AED',defaultTaxRate:0,closedThrough:'',fiscalYearStart:'01-01'};
export function permission(domain, action = 'read') { return `erp.${domain}.${action}`; }
export function actionsFor(module, record) {
  const available = MODULES[module]?.actions || [];
  return available.filter(action => {
    if(action==='archive') return record.status==='active';
    if(action==='submit') return record.status==='draft';
    if(action==='approve'||action==='reject') return record.status==='submitted';
    if(action==='receive') return record.status==='approved';
    if(action==='contract'||action==='invoice') return record.status==='approved'&&!record.convertedId;
    if(action==='bill') return record.status==='received'&&!record.convertedId;
    if(action==='post') return ['expenses','payroll'].includes(module)?record.status==='approved':record.status==='draft';
    if(action==='payment') return record.status==='posted'&&record.outstandingMinor>0;
    if(action==='reverse'||action==='depreciate') return record.status==='posted';
    if(action==='match') return record.status==='draft';
    if(action==='unmatch') return record.status==='matched';
    return action==='cancel'&&['draft','submitted','approved','received'].includes(record.status);
  });
}
export function actionPermission(module, action) {
  if(['post','reverse','depreciate','match','unmatch'].includes(action)) return permission('finance','post');
  if(action==='payment') return permission('finance','write');
  if(action==='invoice'||action==='bill') return permission('finance','write');
  if(['approve','reject','receive'].includes(action)) return permission(MODULES[module].domain,'approve');
  return permission(MODULES[module].domain,'write');
}
