import Link from 'next/link';
import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';
import {emptyTeamMember} from '@/lib/team/schema';
import {projects} from '@/data/projects';
import AdminShell from '@/components/admin/AdminShell';
import TeamMemberForm from '@/components/admin/TeamMemberForm';

export const dynamic = 'force-dynamic';

export default async function AdminTeamNewPage() {
  const {user, navItems} = await requireAdminPage(PERMS.TEAM_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="New team member"
      subtitle="Create a bilingual profile"
      actions={
        <Link className="adm-btn-ghost" href="/admin/team">
          Back to team
        </Link>
      }
    >
      <TeamMemberForm
        mode="create"
        member={emptyTeamMember({status: 'draft', display_order: 10})}
        projectOptions={projects.map((project) => project.slug)}
      />
    </AdminShell>
  );
}
