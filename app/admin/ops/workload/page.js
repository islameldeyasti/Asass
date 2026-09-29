
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasAnyPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import WorkloadBoard from '@/components/admin/ops/WorkloadBoard';
import {listDepartments} from '@/lib/ops/departments';
import {getWorkloadBoard} from '@/lib/ops/workload';

export const dynamic = 'force-dynamic';

export default async function OpsWorkloadPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_VIEW);
  if (
    !hasAnyPermission(session.role, [
      PERMS.OPS_HR_READ,
      PERMS.OPS_EMPLOYEES_READ,
      PERMS.OPS_PROJECTS_READ,
    ])
  ) {
    return (
      <AdminShell user={user} navItems={navItems} title={adminText("Workload")} subtitle={adminText("Forbidden")}>
        <p className="adm-error">{adminText("You do not have permission to view workload.")}</p>
      </AdminShell>
    );
  }

  const [board, departments] = await Promise.all([
    getWorkloadBoard(),
    listDepartments({includeInactive: false}),
  ]);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Workload")}
      subtitle={adminText("Assignment % · open tasks · leave · capacity")}
    >
      <WorkloadBoard initialBoard={board} departments={departments} />
    </AdminShell>
  );
}
