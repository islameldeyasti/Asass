import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {listEnquiries} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import EnquiriesBoard from '@/components/admin/crm/EnquiriesBoard';

export const dynamic = 'force-dynamic';

export default async function AdminCrmEnquiriesPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.ENQUIRIES_READ);
  const items = await listEnquiries();
  const canWrite = hasPermission(session.role, PERMS.ENQUIRIES_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Enquiries"
      subtitle={`${items.length} in CRM pipeline`}
      breadcrumb={
        <nav className="cms-breadcrumb" aria-label="Breadcrumb">
          <span>CRM</span>
          <span aria-hidden>/</span>
          <span>Enquiries</span>
        </nav>
      }
    >
      <EnquiriesBoard canWrite={canWrite} initialItems={items} />
    </AdminShell>
  );
}
