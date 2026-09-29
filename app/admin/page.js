import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/cms/auth';
import {homePathForRole} from '@/lib/cms/permissions';

export default async function AdminIndex() {
  const session = await getAdminSession();
  redirect(session ? homePathForRole(session.role) : '/admin/login');
}
