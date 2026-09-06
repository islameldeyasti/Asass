import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/team/auth';
import {emptyTeamMember} from '@/lib/team/schema';
import {projects} from '@/data/projects';
import TeamMemberForm from '@/components/admin/TeamMemberForm';

export const dynamic = 'force-dynamic';

export default async function AdminTeamNewPage() {
  const ok = await getAdminSession();
  if (!ok) redirect('/admin/login');

  return (
    <TeamMemberForm
      mode="create"
      member={emptyTeamMember({status: 'draft', display_order: 10})}
      projectOptions={projects.map((project) => project.slug)}
    />
  );
}
