import Link from 'next/link';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {listTeamMembers} from '@/lib/team/store';
import AdminShell from '@/components/admin/AdminShell';
import EmployeeCardNewPicker from '@/components/admin/corporate/EmployeeCardNewPicker';

export const dynamic = 'force-dynamic';

export default async function AdminEmployeeCardNewPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.EMPLOYEE_CARDS_WRITE);
  const members = await listTeamMembers({includeDrafts: true});
  const canWrite =
    hasPermission(session.role, PERMS.EMPLOYEE_CARDS_WRITE) ||
    hasPermission(session.role, PERMS.TEAM_WRITE);

  if (!canWrite) {
    return (
      <AdminShell user={user} navItems={navItems} title="Add card">
        <div className="adm-error">You do not have permission to add cards.</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Add employee card"
      subtitle="Select a team member to configure their digital card"
      actions={
        <Link className="adm-btn-ghost" href="/admin/corporate/employee-cards">
          Back to cards
        </Link>
      }
    >
      <EmployeeCardNewPicker members={members} />
    </AdminShell>
  );
}
