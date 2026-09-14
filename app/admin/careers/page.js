import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getJobs} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'title', label: 'Title (EN)', type: 'text'},
  {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
  {key: 'slug', label: 'Slug', type: 'text'},
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      {value: 'open', label: 'Open'},
      {value: 'closed', label: 'Closed'},
    ],
  },
  {key: 'department', label: 'Department', type: 'text'},
  {key: 'location', label: 'Location (EN)', type: 'text'},
  {key: 'locationAr', label: 'Location (AR)', type: 'text', dir: 'rtl'},
  {key: 'type', label: 'Employment type', type: 'text'},
  {key: 'summary', label: 'Summary (EN)', type: 'textarea'},
  {key: 'summaryAr', label: 'Summary (AR)', type: 'textarea', dir: 'rtl'},
  {key: 'description', label: 'Description (EN)', type: 'textarea', rows: 6},
  {key: 'descriptionAr', label: 'Description (AR)', type: 'textarea', rows: 6, dir: 'rtl'},
  {key: 'responsibilities', label: 'Responsibilities (EN)', type: 'list', hint: 'One per line.'},
  {key: 'responsibilitiesAr', label: 'Responsibilities (AR)', type: 'list', dir: 'rtl'},
  {key: 'requirements', label: 'Requirements (EN)', type: 'list', hint: 'One per line.'},
  {key: 'requirementsAr', label: 'Requirements (AR)', type: 'list', dir: 'rtl'},
];

export default async function AdminCareersPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.CAREERS_READ);
  const items = await getJobs();
  const canWrite = hasPermission(session.role, PERMS.CAREERS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Careers"
      subtitle={`${items.length} roles`}
    >
      <CollectionTable
        resource="jobs"
        items={items}
        titleKey="title"
        slugKey="slug"
        canWrite={canWrite}
        fields={FIELDS}
        createDefaults={{
          status: 'open',
          type: 'full-time',
          responsibilities: [],
          responsibilitiesAr: [],
          requirements: [],
          requirementsAr: [],
        }}
      />
    </AdminShell>
  );
}
