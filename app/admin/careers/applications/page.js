import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {listApplications} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import ApplicationsTable from '@/components/admin/crm/ApplicationsTable';

export const dynamic = 'force-dynamic';

export default async function AdminCareersApplicationsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.APPLICATIONS_READ);
  const items = await listApplications();
  const canWrite = hasPermission(session.role, PERMS.CAREERS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Applications"
      subtitle={`${items.length} career applications`}
      breadcrumb={
        <nav className="cms-breadcrumb" aria-label="Breadcrumb">
          <span>Careers</span>
          <span aria-hidden>/</span>
          <span>Applications</span>
        </nav>
      }
    >
      <ApplicationsTable initialItems={items} canWrite={canWrite} />
    </AdminShell>
  );
}
