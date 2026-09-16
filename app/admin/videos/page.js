import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getVideos} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'title', label: 'Title (EN)', type: 'text'},
  {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
  {key: 'id', label: 'ID', type: 'text'},
  {key: 'slug', label: 'Slug', type: 'text'},
  {key: 'youtubeId', label: 'YouTube ID', type: 'text'},
  {key: 'embedUrl', label: 'Embed URL', type: 'text'},
  {key: 'watchUrl', label: 'Watch URL', type: 'text'},
  {key: 'thumbnail', label: 'Thumbnail', type: 'image'},
  {key: 'description', label: 'Description (EN)', type: 'textarea'},
  {key: 'descriptionAr', label: 'Description (AR)', type: 'textarea', dir: 'rtl'},
  {key: 'category', label: 'Category', type: 'text'},
  {key: 'order', label: 'Order', type: 'text'},
  {key: 'featured', label: 'Featured', type: 'checkbox'},
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      {value: 'published', label: 'Published'},
      {value: 'draft', label: 'Draft'},
    ],
  },
];

export default async function AdminVideosPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.VIDEOS_READ);
  const items = await getVideos();
  const canWrite = hasPermission(session.role, PERMS.VIDEOS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Videos"
      subtitle={`${items.length} videos · seeded from asasengg.ae/videos`}
    >
      <CollectionTable
        resource="videos"
        items={items}
        titleKey="title"
        slugKey="slug"
        idKey="id"
        statusKey="status"
        canWrite={canWrite}
        fields={FIELDS}
        createDefaults={{
          category: 'company',
          status: 'published',
          featured: false,
          order: items.length + 1,
        }}
      />
    </AdminShell>
  );
}
