
import {adminText} from '@/lib/admin/translate';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {ArrowUpRight,BriefcaseBusiness,Landmark,ShoppingCart,Users,Clock3,Building2} from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import {requireAdminPage} from '@/lib/cms/guard';
import {permissionsForRole, PERMS, homePathForRole} from '@/lib/cms/permissions';
import {overview} from '@/lib/erp/reports';
import {ErpMetrics} from '@/components/admin/erp/ErpRegister';
import {money} from '@/lib/erp/money';
export const dynamic='force-dynamic';
const ICONS={sales:BriefcaseBusiness,finance:Landmark,purchase:ShoppingCart,hr:Users,time:Clock3,assets:Building2};
export default async function ErpHome(){
  const {session,user,navItems}=await requireAdminPage(PERMS.ERP_VIEW);const actor={id:user.id,role:session.role,permissions:permissionsForRole(session.role)};const data=overview(actor);if(!data.modules.length)redirect(homePathForRole(session.role));
  const stats=data.finance?[{label:'Receivables',value:money(data.finance.receivables,data.currency),hint:'Outstanding customer invoices'},{label:'Supplier payables',value:money(data.finance.payables,data.currency),hint:'Outstanding supplier bills'},{label:'Cash & bank',value:money(data.finance.cash,data.currency),hint:'Posted ledger balance'},{label:'Net result · year to date',value:money(data.finance.profit,data.currency),hint:'Posted revenue less expenses',tone:data.finance.profit>=0?'green':'amber'}]:[{label:'Available modules',value:data.modules.length,hint:'Based on your access'},{label:'Pending reviews',value:data.modules.reduce((n,m)=>n+m.pending,0),hint:'Submitted documents'}];
  return <AdminShell user={user} navItems={navItems} title={adminText("Enterprise workspace")} subtitle={adminText("Commercial, financial and people operations")}><div className="erp-workspace erp-stack"><section className="erp-hero"><div><span className="erp-eyebrow">{adminText(data.companyName)}{adminText(" / ERP")}</span><h2>{adminText("From opportunity to delivery.")}<br/>{adminText("Every transaction connected.")}</h2><p>{adminText("Manage commitments, approvals and financial records in one workspace.")}</p></div><div className="erp-hero-actions"><Link href="/admin/ops">{adminText("Operations ")}<ArrowUpRight size={16}/></Link>{data.finance&&<Link href="/admin/erp/reports">{adminText("Financial reports ")}<ArrowUpRight size={16}/></Link>}</div></section><ErpMetrics items={stats}/><div className="erp-section-heading"><div><span className="erp-eyebrow">{adminText("Connected business modules")}</span><h2>{adminText("Your daily workspace")}</h2></div><span className="erp-muted">{adminText(data.modules.reduce((n,m)=>n+m.pending,0))}{adminText(" awaiting review")}</span></div><div className="erp-modules">{data.modules.map(m=>{const Icon=ICONS[m.domain];return <Link className="erp-module" href={`/admin/erp/${m.key}`} key={m.key}><span className={`erp-module-icon ${m.domain}`}><Icon size={21}/></span><div><span className="erp-eyebrow">{adminText(m.domain)}</span><h3>{adminText(m.label)}</h3><p>{adminText(m.count)}{adminText(" records")}{adminText(m.pending?` · ${m.pending} pending review`:'')}</p></div><ArrowUpRight size={17}/></Link>})}</div></div></AdminShell>;
}
