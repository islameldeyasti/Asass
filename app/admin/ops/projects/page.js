
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import ProjectsManager from '@/components/admin/ops/ProjectsManager';
import {listClients} from '@/lib/ops/clients';
import {listEmployees} from '@/lib/ops/employees';
import {listProjects} from '@/lib/ops/projects';

export const dynamic = 'force-dynamic';

export default async function OpsProjectsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_PROJECTS_READ);
  const [projects, clients, employees] = await Promise.all([
    listProjects(),
    listClients({includeInactive: false}),
    listEmployees(),
  ]);
  const canWrite = hasPermission(session.role, PERMS.OPS_PROJECTS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Ops Projects")}
      subtitle={adminText("Plan delivery, assign ownership and monitor committed dates")}
    >
      <ProjectsManager
        initialProjects={projects}
        clients={clients}
        employees={employees}
        canWrite={canWrite}
      />
    </AdminShell>
  );
}
