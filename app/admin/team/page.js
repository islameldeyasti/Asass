
import {adminText} from '@/lib/admin/translate';
import Link from 'next/link';
import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';
import {listTeamMembers} from '@/lib/team/store';
import AdminShell from '@/components/admin/AdminShell';
import TeamMembersTable from '@/components/admin/TeamMembersTable';

export const dynamic = 'force-dynamic';

export default async function AdminTeamListPage() {
  const {user, navItems} = await requireAdminPage(PERMS.TEAM_READ);
  const members = await listTeamMembers({includeDrafts: true});

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Team")}
      subtitle={adminText(`${members.length} profiles`)}
      actions={
        <Link className="adm-btn" href="/admin/team/new">{adminText("Add team member")}</Link>
      }
    >
      <div className="adm-card">
        {members.length === 0 ? (
          <div className="adm-empty">
            <p>{adminText("No team members yet. Create the first profile to populate /en/team and the homepage section.")}</p>
            <Link className="adm-btn" href="/admin/team/new">{adminText("Create team member")}</Link>
          </div>
        ) : (
          <TeamMembersTable members={members} />
        )}
      </div>
    </AdminShell>
  );
}
