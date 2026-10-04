
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getPageCopy} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import PageCopyManager from '@/components/admin/PageCopyManager';
import './pages-studio.css';

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.PAGES_READ);
  const document = await getPageCopy();
  const canWrite = hasPermission(session.role, PERMS.PAGES_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Pages")}
      subtitle={adminText('Choose a page, edit the hero or CTA, then save')}
    >
      <PageCopyManager initialDocument={document} canWrite={canWrite} />
    </AdminShell>
  );
}
