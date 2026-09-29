import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/cms/auth';
import {ADMIN_NAV} from '@/lib/cms/nav';
import {hasPermission, homePathForRole} from '@/lib/cms/permissions';

export async function requireAdminPage(permission) {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  const home = homePathForRole(session.role);
  if (permission && !hasPermission(session.role, permission)) {
    redirect(home);
  }
  const navItems = ADMIN_NAV.filter((item) => hasPermission(session.role, item.permission));
  return {session, navItems, user: session.user, home};
}
