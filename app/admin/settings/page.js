
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getSettings} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import DocumentForm from '@/components/admin/DocumentForm';
import SettingsLayout, {CMS_SETTINGS_NAV} from '@/components/admin/ui/SettingsLayout';

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
      title={adminText("General settings")}
      subtitle={adminText("Company identity and site-wide defaults")}
    >
      <SettingsLayout items={CMS_SETTINGS_NAV} active="general">
        <DocumentForm
          title={adminText("Company")}
          resource="settings"
          initialValue={document}
          fields={FIELDS}
          canWrite={canWrite}
        />
      </SettingsLayout>
    </AdminShell>
  );
}
