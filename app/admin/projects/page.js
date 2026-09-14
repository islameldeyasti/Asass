import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getProjects} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'title', label: 'Title (EN)', type: 'text'},
  {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
  {key: 'slug', label: 'Slug', type: 'text'},
  {key: 'category', label: 'Category', type: 'text'},
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

export default async function AdminProjectsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.PROJECTS_READ);
  const items = await getProjects();
  const canWrite = hasPermission(session.role, PERMS.PROJECTS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Projects"
      subtitle={`${items.length} projects`}
    >
      <CollectionTable
        resource="projects"
        items={items}
        titleKey="title"
        slugKey="slug"
        canWrite={canWrite}
        fields={FIELDS}
        createDefaults={{status: 'draft'}}
      />
    </AdminShell>
  );
}
