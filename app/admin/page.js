import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/team/auth';

export default async function AdminIndex() {
  const ok = await getAdminSession();
  redirect(ok ? '/admin/team' : '/admin/login');
}
