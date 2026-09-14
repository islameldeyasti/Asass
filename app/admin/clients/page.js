import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getClients} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'name', label: 'Name (EN)', type: 'text'},
  {key: 'nameAr', label: 'Name (AR)', type: 'text', dir: 'rtl'},
  {key: 'id', label: 'ID', type: 'text'},
  {key: 'relationship', label: 'Relationship', type: 'text'},
  {key: 'logo', label: 'Logo', type: 'image'},
];

export default async function AdminClientsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.CLIENTS_READ);
  const items = await getClients();
  const canWrite = hasPermission(session.role, PERMS.CLIENTS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Clients"
      subtitle={`${items.length} clients`}
    >
      <CollectionTable
        resource="clients"
        items={items}
        titleKey="name"
        slugKey="id"
        idKey="id"
        statusKey={null}
        canWrite={canWrite}
        fields={FIELDS}
      />
    </AdminShell>
  );
}
