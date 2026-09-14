import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';
import {getTeamMemberById} from '@/lib/team/store';
import {projects} from '@/data/projects';
import AdminShell from '@/components/admin/AdminShell';
import TeamMemberForm from '@/components/admin/TeamMemberForm';

export const dynamic = 'force-dynamic';

export default async function AdminTeamEditPage({params}) {
  const {user, navItems} = await requireAdminPage(PERMS.TEAM_WRITE);
  const {id} = await params;
  const member = await getTeamMemberById(id);
  if (!member) notFound();

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={member.name_en || 'Edit team member'}
      subtitle={member.slug}
      actions={
        <Link className="adm-btn-ghost" href="/admin/team">
          Back to team
        </Link>
      }
    >
      <TeamMemberForm
        mode="edit"
        member={member}
        projectOptions={projects.map((project) => project.slug)}
      />
    </AdminShell>
  );
}
