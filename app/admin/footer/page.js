import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getFooter} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import FooterManager from '@/components/admin/site/FooterManager';

export const dynamic = 'force-dynamic';

export default async function AdminFooterPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.NAVIGATION_READ);
  const document = await getFooter();
  const canWrite = hasPermission(session.role, PERMS.NAVIGATION_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Footer"
      subtitle="Edit footer links and the call-to-action band. Logo lives in Branding."
    >
      <FooterManager initialValue={document} canWrite={canWrite} />
    </AdminShell>
  );
}
