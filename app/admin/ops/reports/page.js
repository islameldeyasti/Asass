
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import OpsReportsPanel from '@/components/admin/ops/OpsReportsPanel';
import {OPS_REPORT_TYPES} from '@/lib/ops/reports';

export const dynamic = 'force-dynamic';

export default async function OpsReportsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_REPORTS);
  const canHr = hasPermission(session.role, PERMS.OPS_HR_READ);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Ops Reports")}
      subtitle={adminText("CSV exports · projects, tasks, HR, workload")}
    >
      <OpsReportsPanel types={OPS_REPORT_TYPES} canHr={canHr} />
    </AdminShell>
  );
}
