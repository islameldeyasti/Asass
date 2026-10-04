
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getProjects, getSectors, getServices} from '@/lib/cms/content-service';
import {projectCategories} from '@/data/projects';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

export default async function AdminSectorsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.SECTORS_READ);
  const [items, projects, services] = await Promise.all([getSectors(), getProjects(), getServices()]);
  const canWrite = hasPermission(session.role, PERMS.SECTORS_WRITE);

  const fields = [
    {key: 'title', label: 'Title (EN)', type: 'text'},
    {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
    {key: 'slug', label: 'Slug', type: 'text'},
    {
      key: 'projectCategory',
      label: 'Project category',
      type: 'select',
      options: projectCategories
        .filter((item) => item.slug !== 'all')
        .map((item) => ({value: item.slug, label: item.title})),
    },
    {
      key: 'projects',
      label: 'Projects in this sector',
      type: 'relations',
      placeholder: 'Search projects…',
      options: projects.map((item) => ({
        value: item.slug,
        label: item.title || item.slug,
      })),
    },
    {
      key: 'services',
      label: 'Services in this sector',
      type: 'relations',
      placeholder: 'Search services…',
      options: services.map((item) => ({
        value: item.slug,
        label: item.title || item.slug,
      })),
    },
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

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText('Sectors')}
      subtitle={adminText(`${items.length} sectors`)}
    >
      <CollectionTable
        resource="sectors"
        items={items}
        titleKey="title"
        slugKey="slug"
        canWrite={canWrite}
        fields={fields}
        createDefaults={{status: 'published', projects: [], services: []}}
      />
    </AdminShell>
  );
}
