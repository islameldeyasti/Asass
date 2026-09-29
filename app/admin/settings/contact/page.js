
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getSettings} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import DocumentForm from '@/components/admin/DocumentForm';
import SettingsLayout, {CMS_SETTINGS_NAV} from '@/components/admin/ui/SettingsLayout';

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
      title={adminText("Contact")}
      subtitle={adminText("Phone, email, WhatsApp, and office address")}
    >
      <SettingsLayout items={CMS_SETTINGS_NAV} active="contact">
      <DocumentForm
        title={adminText("Contact details")}
        resource="settings"
        initialValue={document}
        fields={FIELDS}
        canWrite={canWrite}
      />
      </SettingsLayout>
    </AdminShell>
  );
}
