import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {listUsers, toPublicUser} from '@/lib/cms/users-store';
import AdminShell from '@/components/admin/AdminShell';
import UsersManager from '@/components/admin/UsersManager';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.USERS_READ);
  const users = (await listUsers()).map(toPublicUser);
  const canWrite = hasPermission(session.role, PERMS.USERS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Users & roles"
      subtitle="Control who can edit content and SEO"
    >
      <UsersManager initialUsers={users} canWrite={canWrite} />
    </AdminShell>
  );
}
