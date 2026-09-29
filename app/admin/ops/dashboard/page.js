
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import OpsDashboardView from '@/components/admin/ops/OpsDashboardView';
import {getOpsInsights} from '@/lib/ops/insights';

export const dynamic = 'force-dynamic';

export default async function OpsDashboardPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_VIEW);
  const canHr = hasPermission(session.role, PERMS.OPS_HR_READ);
  const insights = await getOpsInsights({canHr});

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Ops Dashboard")}
      subtitle={adminText("Executive KPIs · attention queue · recent activity")}
    >
      <OpsDashboardView insights={insights} canHr={canHr} />
    </AdminShell>
  );
}
