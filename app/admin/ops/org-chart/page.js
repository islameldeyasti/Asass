
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import OrgChartView from '@/components/admin/ops/OrgChartView';
import {getOrgChart} from '@/lib/ops/employees';

export const dynamic = 'force-dynamic';

export default async function OpsOrgChartPage() {
  const {user, navItems} = await requireAdminPage(PERMS.OPS_EMPLOYEES_READ);
  const chart = await getOrgChart();

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Organization Chart")}
      subtitle={adminText("Department leadership, reporting lines and team structure")}
    >
      <OrgChartView chart={chart} />
    </AdminShell>
  );
}
