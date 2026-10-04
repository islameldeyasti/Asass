
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getProjects, getSectors, getServices} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.PROJECTS_READ);
  const [items, sectors, services] = await Promise.all([getProjects(), getSectors(), getServices()]);
  const canWrite = hasPermission(session.role, PERMS.PROJECTS_WRITE);

  const fields = [
    {key: 'title', label: 'Title (EN)', type: 'text'},
    {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
    {key: 'slug', label: 'Slug', type: 'text'},
    {
      key: 'sectors',
      label: 'Sectors',
      type: 'relations',
      placeholder: 'Search sectors…',
      options: sectors.map((item) => ({
        value: item.slug,
        label: item.title || item.slug,
      })),
    },
    {
      key: 'services',
      label: 'Services',
      type: 'relations',
      placeholder: 'Search services…',
      options: services.map((item) => ({
        value: item.slug,
        label: item.title || item.slug,
      })),
    },
    {key: 'location', label: 'Location (EN)', type: 'text'},
    {key: 'locationAr', label: 'Location (AR)', type: 'text', dir: 'rtl'},
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
    {key: 'image', label: 'Hero / cover image', type: 'image'},
    {key: 'images', label: 'Project gallery', type: 'gallery'},
    {key: 'kind', label: 'Kind', type: 'text'},
  ];

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText('Projects')}
      subtitle={adminText(`${items.length} projects`)}
    >
      <CollectionTable
        resource="projects"
        items={items}
        titleKey="title"
        slugKey="slug"
        canWrite={canWrite}
        fields={fields}
        createDefaults={{status: 'draft', sectors: [], services: []}}
      />
    </AdminShell>
  );
}
