import Link from 'next/link';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getSettings} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import DocumentForm from '@/components/admin/DocumentForm';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'company.phone', label: 'Phone', type: 'text'},
  {key: 'company.mobile', label: 'Mobile / WhatsApp', type: 'text'},
  {key: 'company.email', label: 'Email', type: 'text'},
  {key: 'company.fax', label: 'Fax', type: 'text'},
  {key: 'company.website', label: 'Website', type: 'text'},
  {key: 'company.address', label: 'Address (EN)', type: 'textarea', rows: 3},
  {key: 'company.addressAr', label: 'Address (AR)', type: 'textarea', rows: 3, dir: 'rtl'},
];

export default async function AdminContactSettingsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.SETTINGS_READ);
  const document = await getSettings();
  const canWrite = hasPermission(session.role, PERMS.SETTINGS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Contact"
      subtitle="Phone, email, WhatsApp, and office address"
      actions={
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
          <Link className="adm-btn-ghost" href="/admin/settings">
            General
          </Link>
          <Link className="adm-btn-ghost" href="/admin/settings/branding">
            Branding
          </Link>
          <Link className="adm-btn-ghost" href="/admin/settings/social">
            Social
          </Link>
        </div>
      }
    >
      <DocumentForm
        title="Contact details"
        resource="settings"
        initialValue={document}
        fields={FIELDS}
        canWrite={canWrite}
      />
    </AdminShell>
  );
}
