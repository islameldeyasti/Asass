import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {listMedia} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import MediaLibraryPage from '@/components/admin/media/MediaLibraryPage';

export const dynamic = 'force-dynamic';

export default async function AdminMediaPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.MEDIA_READ);
  const items = await listMedia();
  const canWrite = hasPermission(session.role, PERMS.MEDIA_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Media"
      subtitle={`${items.length} assets`}
    >
      <MediaLibraryPage initialItems={items} canWrite={canWrite} />
    </AdminShell>
  );
}
