import {notFound} from 'next/navigation';
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getUserById, toPublicUser} from '@/lib/cms/users-store';
import AdminShell from '@/components/admin/AdminShell';
import UserProfileForm from '@/components/admin/UserProfileForm';

export const dynamic = 'force-dynamic';

export default async function AdminUserProfilePage({params}) {
  const {id} = await params;
  const {user, navItems, session} = await requireAdminPage(PERMS.USERS_READ);
  const target = await getUserById(id);
  if (!target) notFound();
  const canWrite = hasPermission(session.role, PERMS.USERS_WRITE) || session.user.id === target.id;

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText(target.name)}
      subtitle={adminText('User profile')}
    >
      <UserProfileForm
        user={toPublicUser(target)}
        isSelf={session.user.id === target.id}
        canWrite={canWrite}
        endpoint={session.user.id === target.id ? '/api/admin/profile' : '/api/admin/users'}
      />
    </AdminShell>
  );
}
