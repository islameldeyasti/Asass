import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/cms/auth';
import {homePathForRole} from '@/lib/cms/permissions';

export default async function AdminLoginLayout({children}) {
  const session = await getAdminSession();
  if (session) redirect(homePathForRole(session.role));
  return children;
}
