import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getHomepage} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import DocumentForm from '@/components/admin/DocumentForm';

export const dynamic = 'force-dynamic';

export default async function AdminHomepagePage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.HOMEPAGE_READ);
  const document = await getHomepage();
  const canWrite = hasPermission(session.role, PERMS.HOMEPAGE_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Homepage"
      subtitle="Sections, hero slides, sector cards, about, and FAQs"
    >
      <DocumentForm
        resource="homepage"
        initialValue={document}
        fields={[]}
        canWrite={canWrite}
        sectionEditor
        heroSlidesEditor
        sectorCardsEditor
        aboutEditor
        faqEditor
      />
    </AdminShell>
  );
}
