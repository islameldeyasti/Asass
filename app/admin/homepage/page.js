
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getHomepage} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import HomepageStudio from '@/components/admin/HomepageStudio';
import '../pages/pages-studio.css';
import './homepage-studio.css';

export const dynamic = 'force-dynamic';

export default async function AdminHomepagePage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.HOMEPAGE_READ);
  const document = await getHomepage();
  const canWrite = hasPermission(session.role, PERMS.HOMEPAGE_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText('Homepage')}
      subtitle={adminText('Layout, hero slides, about, sectors, and FAQs')}
    >
      <HomepageStudio initialValue={document} canWrite={canWrite} />
    </AdminShell>
  );
}
