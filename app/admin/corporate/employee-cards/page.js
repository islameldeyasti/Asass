import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {listTeamMembers} from '@/lib/team/store';
import AdminShell from '@/components/admin/AdminShell';
import EmployeeCardsStudio from '@/components/admin/corporate/EmployeeCardsStudio';

export const dynamic = 'force-dynamic';

export default async function AdminEmployeeCardsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.EMPLOYEE_CARDS_READ);
  const members = await listTeamMembers({includeDrafts: true});
  const canWrite = hasPermission(session.role, PERMS.EMPLOYEE_CARDS_WRITE);
  const canPublish = hasPermission(session.role, PERMS.EMPLOYEE_CARDS_PUBLISH);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Employee Cards"
      subtitle="Digital profiles, printable cards, and QR codes"
    >
      <EmployeeCardsStudio
        members={members}
        canWrite={canWrite || hasPermission(session.role, PERMS.TEAM_WRITE)}
        canPublish={canPublish || hasPermission(session.role, PERMS.TEAM_WRITE)}
      />
    </AdminShell>
  );
}
