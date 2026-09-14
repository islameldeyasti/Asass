import {redirect} from 'next/navigation';
import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';

export const dynamic = 'force-dynamic';

export default async function AdminSeoRedirectsPage() {
  await requireAdminPage(PERMS.SEO_READ);
  redirect('/admin/seo?tab=redirects');
}
