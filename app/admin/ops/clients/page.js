
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import ClientsManager from '@/components/admin/ops/ClientsManager';
import {listProjects} from '@/lib/ops/projects';
import {listClients} from '@/lib/ops/clients';

export const dynamic = 'force-dynamic';

export default async function OpsClientsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_CLIENTS_READ);
  const clients = await listClients({includeInactive: true});
  const projects = hasPermission(session.role, PERMS.OPS_PROJECTS_READ) ? await listProjects() : [];
  const canWrite = hasPermission(session.role, PERMS.OPS_CLIENTS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Ops Clients")}
      subtitle={adminText("Client relationships, contacts and connected delivery projects")}
    >
      <ClientsManager initialClients={clients} projects={projects} canWrite={canWrite} />
    </AdminShell>
  );
}
