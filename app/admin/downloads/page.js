import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getDownloads} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'titleEn', label: 'Title (EN)', type: 'text'},
  {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
  {key: 'id', label: 'ID', type: 'text'},
  {key: 'href', label: 'File', type: 'media', mode: 'DOCUMENT'},
  {key: 'size', label: 'Size label', type: 'text'},
  {key: 'order', label: 'Order', type: 'number'},
  {key: 'featured', label: 'Featured', type: 'checkbox'},
];

export default async function AdminDownloadsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.DOWNLOADS_READ);
  const items = await getDownloads();
  const canWrite = hasPermission(session.role, PERMS.DOWNLOADS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Downloads"
      subtitle={`${items.length} files`}
    >
      <CollectionTable
        resource="downloads"
        items={items}
        titleKey="titleEn"
        slugKey="id"
        idKey="id"
        statusKey={null}
        canWrite={canWrite}
        fields={FIELDS}
        createDefaults={{featured: false, order: 100}}
      />
    </AdminShell>
  );
}
