import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getGalleryItems} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'title', label: 'Title (EN)', type: 'text'},
  {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
  {key: 'id', label: 'ID', type: 'text'},
  {key: 'slug', label: 'Slug', type: 'text'},
  {key: 'src', label: 'Image', type: 'image'},
  {key: 'category', label: 'Category', type: 'text'},
  {key: 'folder', label: 'Folder', type: 'text'},
];

export default async function AdminGalleryPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.GALLERY_READ);
  const items = await getGalleryItems();
  const canWrite = hasPermission(session.role, PERMS.GALLERY_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Gallery"
      subtitle={`${items.length} images`}
    >
      <CollectionTable
        resource="gallery"
        items={items}
        titleKey="title"
        slugKey="slug"
        idKey="id"
        statusKey={null}
        canWrite={canWrite}
        fields={FIELDS}
        createDefaults={{category: 'architecture'}}
      />
    </AdminShell>
  );
}
