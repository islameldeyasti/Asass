import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getNavigation} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import DocumentForm from '@/components/admin/DocumentForm';

export const dynamic = 'force-dynamic';

export default async function AdminNavigationPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.NAVIGATION_READ);
  const document = await getNavigation();
  const canWrite = hasPermission(session.role, PERMS.NAVIGATION_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Navigation"
      subtitle="Manage the main website menu — labels, pages, and visibility"
    >
      <DocumentForm
        resource="navigation"
        initialValue={document}
        fields={[]}
        canWrite={canWrite}
        navEditor
      />
    </AdminShell>
  );
}
