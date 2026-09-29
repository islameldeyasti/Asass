
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getSettings} from '@/lib/cms/content-service';
import {normalizeBranding} from '@/lib/cms/branding';
import AdminShell from '@/components/admin/AdminShell';
import BrandingSettingsForm from '@/components/admin/settings/BrandingSettingsForm';
import SettingsLayout, {CMS_SETTINGS_NAV} from '@/components/admin/ui/SettingsLayout';

export const dynamic = 'force-dynamic';

export default async function AdminBrandingSettingsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.SETTINGS_READ);
  const settings = await getSettings();
  const canWrite = hasPermission(session.role, PERMS.SETTINGS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Branding")}
      subtitle={adminText("Logos, favicon, and social sharing images")}
    >
      <SettingsLayout items={CMS_SETTINGS_NAV} active="branding">
      <BrandingSettingsForm
        initialBranding={normalizeBranding(settings?.branding)}
        canWrite={canWrite}
      />
      </SettingsLayout>
    </AdminShell>
  );
}
