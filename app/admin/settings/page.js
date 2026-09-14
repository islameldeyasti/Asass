import Link from 'next/link';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getSettings} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import DocumentForm from '@/components/admin/DocumentForm';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'company.name', label: 'Company name (EN)', type: 'text'},
  {key: 'company.nameAr', label: 'Company name (AR)', type: 'text', dir: 'rtl'},
  {key: 'company.shortName', label: 'Short name (EN)', type: 'text'},
  {key: 'company.shortNameAr', label: 'Short name (AR)', type: 'text', dir: 'rtl'},
  {key: 'company.website', label: 'Website', type: 'text'},
  {key: 'company.shortDescription', label: 'Short description (EN)', type: 'textarea'},
  {key: 'company.shortDescriptionAr', label: 'Short description (AR)', type: 'textarea', dir: 'rtl'},
  {key: 'stats', label: 'Stats (JSON — advanced)', type: 'json', rows: 8},
];

export default async function AdminSettingsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.SETTINGS_READ);
  const document = await getSettings();
  const canWrite = hasPermission(session.role, PERMS.SETTINGS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="General settings"
      subtitle="Company identity and site-wide defaults"
      actions={
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
          <Link className="adm-btn" href="/admin/settings/branding">
            Branding
          </Link>
          <Link className="adm-btn-ghost" href="/admin/settings/contact">
            Contact
          </Link>
          <Link className="adm-btn-ghost" href="/admin/settings/social">
            Social
          </Link>
        </div>
      }
    >
      <DocumentForm
        title="Company"
        resource="settings"
        initialValue={document}
        fields={FIELDS}
        canWrite={canWrite}
      />
    </AdminShell>
  );
}
