import {notFound, redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/team/auth';
import {getTeamMemberById} from '@/lib/team/store';
import {projects} from '@/data/projects';
import TeamMemberForm from '@/components/admin/TeamMemberForm';

export const dynamic = 'force-dynamic';

export default async function AdminTeamEditPage({params}) {
  const ok = await getAdminSession();
  if (!ok) redirect('/admin/login');

  const {id} = await params;
  const member = await getTeamMemberById(id);
  if (!member) notFound();

  return (
    <TeamMemberForm
      mode="edit"
      member={member}
      projectOptions={projects.map((project) => project.slug)}
    />
  );
}
