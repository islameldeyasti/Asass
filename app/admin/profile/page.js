import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {toPublicUser, getUserById} from '@/lib/cms/users-store';
import AdminShell from '@/components/admin/AdminShell';
import UserProfileForm from '@/components/admin/UserProfileForm';

export const dynamic = 'force-dynamic';

export default async function MyProfilePage() {
  const {user, navItems, session} = await requireAdminPage();
  const full = toPublicUser((await getUserById(session.user.id)) || session.user);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText('User profile')}
      subtitle={adminText('Photo, contact details and password')}
    >
      <UserProfileForm user={full} isSelf canWrite />
    </AdminShell>
  );
}
