import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getTestimonials} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'quote', label: 'Quote (EN)', type: 'textarea'},
  {key: 'quoteAr', label: 'Quote (AR)', type: 'textarea', dir: 'rtl'},
  {key: 'id', label: 'ID', type: 'text'},
  {key: 'role', label: 'Role (EN)', type: 'text'},
  {key: 'roleAr', label: 'Role (AR)', type: 'text', dir: 'rtl'},
  {key: 'company', label: 'Company (EN)', type: 'text'},
  {key: 'companyAr', label: 'Company (AR)', type: 'text', dir: 'rtl'},
  {key: 'sector', label: 'Sector (EN)', type: 'text'},
  {key: 'sectorAr', label: 'Sector (AR)', type: 'text', dir: 'rtl'},
  {key: 'rating', label: 'Rating', type: 'number'},
];

export default async function AdminTestimonialsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.TESTIMONIALS_READ);
  const items = await getTestimonials();
  const canWrite = hasPermission(session.role, PERMS.TESTIMONIALS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Testimonials"
      subtitle={`${items.length} testimonials`}
    >
      <CollectionTable
        resource="testimonials"
        items={items}
        titleKey="company"
        slugKey="id"
        idKey="id"
        statusKey={null}
        canWrite={canWrite}
        fields={FIELDS}
        createDefaults={{rating: 5}}
      />
    </AdminShell>
  );
}
