
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getSettings} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import DocumentForm from '@/components/admin/DocumentForm';
import SettingsLayout, {CMS_SETTINGS_NAV} from '@/components/admin/ui/SettingsLayout';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'socialLinks.linkedin', label: 'LinkedIn URL', type: 'text'},
  {key: 'socialLinks.instagram', label: 'Instagram URL', type: 'text'},
  {key: 'socialLinks.facebook', label: 'Facebook URL', type: 'text'},
  {key: 'socialLinks.youtube', label: 'YouTube URL', type: 'text'},
];

export default async function AdminSocialSettingsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.SETTINGS_READ);
  const document = await getSettings();
  const canWrite = hasPermission(session.role, PERMS.SETTINGS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Social")}
      subtitle={adminText("Profiles used by the footer and floating social bar")}
    >
      <SettingsLayout items={CMS_SETTINGS_NAV} active="social">
      <DocumentForm
        title={adminText("Social profiles")}
        resource="settings"
        initialValue={document}
        fields={FIELDS}
        canWrite={canWrite}
      />
      </SettingsLayout>
    </AdminShell>
  );
}
