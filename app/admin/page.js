import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/cms/auth';

export default async function AdminIndex() {
  const session = await getAdminSession();
  redirect(session ? '/admin/dashboard' : '/admin/login');
}
