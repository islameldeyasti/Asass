import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getSectors} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'title', label: 'Title (EN)', type: 'text'},
  {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
  {key: 'slug', label: 'Slug', type: 'text'},
  {key: 'projectCategory', label: 'Project category', type: 'text'},
  {
    key: 'image',
    label: 'Listing / hero image',
    type: 'image',
    hint: 'Used on sectors listing, detail hero, and related cards.',
  },
  {key: 'description', label: 'Description (EN)', type: 'textarea'},
  {key: 'descriptionAr', label: 'Description (AR)', type: 'textarea', dir: 'rtl'},
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      {value: 'draft', label: 'Draft'},
      {value: 'published', label: 'Published'},
    ],
  },
];

export default async function AdminSectorsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.SECTORS_READ);
  const items = await getSectors();
  const canWrite = hasPermission(session.role, PERMS.SECTORS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Sectors"
      subtitle={`${items.length} sectors`}
    >
      <CollectionTable
        resource="sectors"
        items={items}
        titleKey="title"
        slugKey="slug"
        canWrite={canWrite}
        fields={FIELDS}
        createDefaults={{status: 'published'}}
      />
    </AdminShell>
  );
}
