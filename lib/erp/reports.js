import {database,records,settings} from './database.js';
import {authorize,allowed,opsRecords} from './engine.js';
import {validDate,fail} from './money.js';
import {MODULES,permission} from './config.js';
import {vatSummary} from './compliance.js';

function toPlain(value) {
  return JSON.parse(JSON.stringify(value));
}

export function financialReports(actor,from='2000-01-01',to=new Date().toISOString().slice(0,10)){
  authorize(actor,permission('finance'));validDate(from);validDate(to);if(from>to)fail('Report start date must precede end date');
  const db=database();
  const trial=db.prepare(`SELECT a.code,a.name,a.type,COALESCE(SUM(CASE WHEN e.date<=? THEN l.debit ELSE 0 END),0) debit,COALESCE(SUM(CASE WHEN e.date<=? THEN l.credit ELSE 0 END),0) credit FROM accounts a LEFT JOIN ledger_lines l ON l.account=a.code LEFT JOIN ledger e ON e.id=l.entry_id GROUP BY a.code ORDER BY a.code`).all(to,to).map(r=>({...r,balance:r.debit-r.credit}));
  const period=db.prepare(`SELECT a.code,a.name,a.type,SUM(l.debit) debit,SUM(l.credit) credit FROM ledger_lines l JOIN ledger e ON e.id=l.entry_id JOIN accounts a ON a.code=l.account WHERE e.date>=? AND e.date<=? AND a.type IN ('income','expense') GROUP BY a.code ORDER BY a.code`).all(from,to);
  const income=period.filter(r=>r.type==='income').reduce((s,r)=>s+r.credit-r.debit,0);
  const expense=period.filter(r=>r.type==='expense').reduce((s,r)=>s+r.debit-r.credit,0);
  const activeAt=(r)=>['posted','reversed'].includes(r.status)&&r.date<=to&&(!r.reversalDate||r.reversalDate>to);
  const payments=records('payments',db).filter(activeAt);
  const aging=['invoices','bills'].flatMap(module=>records(module,db).filter(activeAt).map(r=>{
    const outstanding=r.totalMinor-payments.filter(p=>p.target===r.id).reduce((s,p)=>s+p.totalMinor,0);
    const days=r.dueDate?Math.max(0,Math.floor((Date.parse(to)-Date.parse(r.dueDate))/86400000)):0;
    return {id:r.id,module,number:r.number,party:r.partySnapshot?.name||r.title,date:r.date,dueDate:r.dueDate||'',days,bucket:days===0?'Current':days<=30?'1–30 days':days<=60?'31–60 days':days<=90?'61–90 days':'90+ days',outstanding};
  })).filter(r=>r.outstanding>0);
  const ledger=db.prepare(`SELECT e.id,e.date,e.memo,r.number,l.account,a.name,l.debit,l.credit,l.project_id projectId FROM ledger e JOIN records r ON r.id=e.source_id JOIN ledger_lines l ON l.entry_id=e.id JOIN accounts a ON a.code=l.account WHERE e.date>=? AND e.date<=? ORDER BY e.date DESC,e.rowid DESC,l.id LIMIT 2000`).all(from,to);
  const projectCosts=db.prepare(`SELECT l.project_id projectId,SUM(l.debit-l.credit) cost FROM ledger_lines l JOIN ledger e ON e.id=l.entry_id JOIN accounts a ON a.code=l.account WHERE a.type='expense' AND l.project_id IS NOT NULL AND e.date<=? GROUP BY l.project_id`).all(to);
  const time=records('time-entries',db).filter(r=>r.status==='approved'&&r.date<=to);
  const budgets=records('budgets',db).filter(r=>r.status==='approved'&&r.date<=to);
  const projects=opsRecords('projects').map(p=>{
    const entries=time.filter(t=>t.projectId===p.id);const actual=projectCosts.find(c=>c.projectId===p.id)?.cost||0;
    const effort=entries.reduce((n,t)=>n+t.totalMinor,0);const budget=budgets.find(b=>b.projectId===p.id)?.totalMinor||0;
    return {id:p.id,name:p.nameEn,code:p.code,budget,ledgerCost:actual,effortCost:effort,managementCost:actual+effort,variance:budget-actual-effort,hours:entries.reduce((n,t)=>n+t.hoursMilli,0)/1000};
  });
  const retained=trial.filter(r=>['income','expense'].includes(r.type)).reduce((s,r)=>s-r.balance,0);
  return toPlain({from,to,currency:settings(db).currency,trial,period,income,expense,profit:income-expense,aging,ledger,projects,vat:vatSummary(to),balanceSheet:{assets:trial.filter(r=>r.type==='asset').reduce((s,r)=>s+r.balance,0),liabilities:trial.filter(r=>r.type==='liability').reduce((s,r)=>s-r.balance,0),equity:trial.filter(r=>r.type==='equity').reduce((s,r)=>s-r.balance,0),retained}});
}
export function overview(actor){
  const db=database();const modules=Object.entries(MODULES).filter(([,config])=>allowed(actor,permission(config.domain))).map(([key,config])=>({key,label:config.label,domain:config.domain,count:records(key,db).length,pending:records(key,db).filter(r=>r.status==='submitted').length}));
  const summary={modules,currency:settings(db).currency,companyName:settings(db).companyName};
  if(allowed(actor,permission('finance'))){const report=financialReports(actor,`${new Date().getFullYear()}-01-01`);summary.finance={receivables:report.aging.filter(r=>r.module==='invoices').reduce((s,r)=>s+r.outstanding,0),payables:report.aging.filter(r=>r.module==='bills').reduce((s,r)=>s+r.outstanding,0),income:report.income,expense:report.expense,profit:report.profit,cash:report.trial.filter(a=>['1000','1010'].includes(a.code)).reduce((s,r)=>s+r.balance,0)};}
  return summary;
}
