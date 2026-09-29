
import {adminText} from '@/lib/admin/translate';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import {formatAdminDateTime, summarizeAuditDetails} from '@/lib/admin/locale';
import {requireAdminPage} from '@/lib/cms/guard';
import {permissionsForRole} from '@/lib/cms/permissions';
import {MODULES,permission} from '@/lib/erp/config';
import {listDocuments,lookupData,companySettings,auditTrail} from '@/lib/erp/engine';
import {settings} from '@/lib/erp/database';
import {financialReports} from '@/lib/erp/reports';
import ErpRegister from '@/components/admin/erp/ErpRegister';
import ErpReports from '@/components/admin/erp/ErpReports';
import ErpSettings from '@/components/admin/erp/ErpSettings';
import ClientDataTable from '@/components/admin/ui/ClientDataTable';
export const dynamic='force-dynamic';
export default async function ErpModulePage({params,searchParams}){
  const {module}=await params;const search=await searchParams;const config=Object.hasOwn(MODULES,module)?MODULES[module]:null;
  if(!config&&!['reports','settings','audit'].includes(module))notFound();
  const required=config?permission(config.domain):module==='reports'?permission('finance'):module==='settings'?'erp.settings':'erp.audit';
  const {user,session,navItems}=await requireAdminPage(required);const actor={id:user.id,role:session.role,permissions:permissionsForRole(session.role)};
  const title=config?.label||{reports:'Financial reporting',settings:'Company & accounting periods',audit:'ERP audit trail'}[module];
  let content;
  if(config){const company=settings();content=<ErpRegister key={module} module={module} actor={actor} selectedId={typeof search.record==='string'?search.record:''} initialData={{items:listDocuments(module,actor),lookups:lookupData(module,actor),currency:company.currency,defaultTaxRate:company.defaultTaxRate}}/>;}
  if(module==='reports')content=<ErpReports initialReport={financialReports(actor)}/>;
  if(module==='settings')content=<ErpSettings initialSettings={companySettings(actor)}/>;
  if(module==='audit')content=<ClientDataTable title="ERP audit trail" filename="erp-audit" filterKey="action" columns={[{key:'when',label:'When'},{key:'actor',label:'Actor'},{key:'action',label:'Action'},{key:'reference',label:'Reference'},{key:'details',label:'Details'}]} rows={auditTrail(actor).map((event)=>({id:event.id,when:formatAdminDateTime(event.at),actor:event.actor,action:event.action,reference:event.record_id||'Company',details:summarizeAuditDetails(event.details)}))}/>;
  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText(title)}
      subtitle={adminText(config?.description || 'ASAS business records and controls')}
      breadcrumb={
        <nav className="cms-breadcrumb" aria-label={adminText('Breadcrumb')}>
          <Link key="erp" href="/admin/erp">
            {adminText('ERP workspace')}
          </Link>
          <span key="sep" className="cms-breadcrumb-sep">
            /
          </span>
          <span key="current" className="cms-breadcrumb-current">
            {adminText(title)}
          </span>
        </nav>
      }
    >
      <div className="erp-workspace erp-stack">{content}</div>
    </AdminShell>
  );
}
