import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getPublicCompany} from '@/lib/cms/public-data';
import AdminShell from '@/components/admin/AdminShell';
import LetterheadStudio from '@/components/admin/corporate/LetterheadStudio';

export const dynamic = 'force-dynamic';

export default async function AdminLetterheadDetailPage({params}) {
  const {user, navItems, session} = await requireAdminPage(PERMS.LETTERHEADS_READ);
  const company = await getPublicCompany();
  const canWrite = hasPermission(session.role, PERMS.LETTERHEADS_WRITE);
  const {id} = await params;

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Letterhead Studio"
      subtitle="Compose, preview, and print branded ASAS letters"
    >
      <LetterheadStudio
        company={company}
        logoUrl="/assets/asas/corporate/asas-letterhead-mark.png"
        canWrite={canWrite}
        initialId={id}
      />
    </AdminShell>
  );
}
