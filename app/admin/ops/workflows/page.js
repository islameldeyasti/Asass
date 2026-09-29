
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import StageTemplatesManager from '@/components/admin/ops/StageTemplatesManager';
import {listDepartments} from '@/lib/ops/departments';
import {listStageTemplates} from '@/lib/ops/stages';

export const dynamic = 'force-dynamic';

export default async function OpsWorkflowsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_PROJECTS_READ);
  const templates = await listStageTemplates({includeInactive: true});
  const departments = await listDepartments();
  const canWrite = hasPermission(session.role, PERMS.OPS_PROJECTS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Workflows")}
      subtitle={adminText("Standardize delivery stages, ownership and review gates")}
    >
      <StageTemplatesManager initialTemplates={templates} departments={departments} canWrite={canWrite} />
    </AdminShell>
  );
}
