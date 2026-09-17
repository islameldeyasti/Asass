import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getPageCopy} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import PageCopyManager from '@/components/admin/PageCopyManager';

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.PAGES_READ);
  const document = await getPageCopy();
  const canWrite = hasPermission(session.role, PERMS.PAGES_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Pages"
      subtitle="Edit bilingual meta, hero, and CTA bands — including background image uploads"
    >
      <PageCopyManager initialDocument={document} canWrite={canWrite} />
    </AdminShell>
  );
}
