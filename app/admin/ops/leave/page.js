
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import LeaveManager from '@/components/admin/ops/LeaveManager';
import {getEmployeeByCmsUserId, listEmployees} from '@/lib/ops/employees';
import {leaveBalanceSummary, listLeaveRequests} from '@/lib/ops/leave';

export const dynamic = 'force-dynamic';

export default async function OpsLeavePage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_VIEW);
  const isHr = hasPermission(session.role, PERMS.OPS_HR_READ);
  const canDecide = hasPermission(session.role, PERMS.OPS_HR_WRITE);
  const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
  const employees = await listEmployees();
  const items = await listLeaveRequests(isHr ? {} : {employeeId: me?.id || '__none__'});
  const balances = isHr ? {} : leaveBalanceSummary(items, me?.id || null);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Leave")}
      subtitle={
        adminText(isHr
          ? 'Leave requests · approve/reject · balances'
          : 'Request leave and track your own requests')
      }
    >
      <LeaveManager
        initialItems={items}
        initialBalances={balances}
        employees={employees}
        meEmployeeId={me?.id || null}
        isHr={isHr}
        canDecide={canDecide}
      />
    </AdminShell>
  );
}
