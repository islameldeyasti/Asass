import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getServices} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'title', label: 'Title (EN)', type: 'text'},
  {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
  {key: 'slug', label: 'Slug', type: 'text'},
  {key: 'group', label: 'Group', type: 'text'},
  {
    key: 'image',
    label: 'Listing / hero image',
    type: 'image',
    hint: 'Used on services listing, detail hero, and related cards.',
  },
  {key: 'description', label: 'Description (EN)', type: 'textarea'},
  {key: 'descriptionAr', label: 'Description (AR)', type: 'textarea', dir: 'rtl'},
  {
    key: 'capabilities',
    label: 'Capabilities (EN)',
    type: 'list',
    hint: 'One capability per line.',
  },
  {
    key: 'capabilitiesAr',
    label: 'Capabilities (AR)',
    type: 'list',
    dir: 'rtl',
    hint: 'One capability per line.',
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      {value: 'draft', label: 'Draft'},
      {value: 'published', label: 'Published'},
    ],
  },
  {key: 'featured', label: 'Featured', type: 'checkbox'},
];

export default async function AdminServicesPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.SERVICES_READ);
  const items = await getServices();
  const canWrite = hasPermission(session.role, PERMS.SERVICES_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Services"
      subtitle={`${items.length} services`}
    >
      <CollectionTable
        resource="services"
        items={items}
        titleKey="title"
        slugKey="slug"
        canWrite={canWrite}
        fields={FIELDS}
        createDefaults={{status: 'published', featured: false, capabilities: [], capabilitiesAr: []}}
      />
    </AdminShell>
  );
}
