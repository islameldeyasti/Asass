
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import ApprovalsInbox from '@/components/admin/ops/ApprovalsInbox';
import {listApprovals} from '@/lib/ops/approvals';
import {listEmployees} from '@/lib/ops/employees';
import {listProjects} from '@/lib/ops/projects';

export const dynamic = 'force-dynamic';

export default async function OpsApprovalsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_APPROVALS_READ);
  const [items, employees, projects] = await Promise.all([
    listApprovals(),
    listEmployees(),
    listProjects(),
  ]);
  const canWrite = hasPermission(session.role, PERMS.OPS_APPROVALS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Approvals")}
      subtitle={adminText("Cross-project approval inbox · decide steps from here or Project 360")}
    >
      <ApprovalsInbox
        initialItems={items}
        employees={employees}
        projects={projects}
        canWrite={canWrite}
      />
    </AdminShell>
  );
}
