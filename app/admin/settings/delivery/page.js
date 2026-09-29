
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import SettingsLayout, {CMS_SETTINGS_NAV} from '@/components/admin/ui/SettingsLayout';
import DeliveryConsole from '@/components/admin/DeliveryConsole';

export const dynamic = 'force-dynamic';

export default async function DeliverySettingsPage() {
  const {user, navItems} = await requireAdminPage(PERMS.SETTINGS_READ);
  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText('Delivery')}
      subtitle={adminText('Backup, identity sync, and mail readiness')}
    >
      <SettingsLayout items={CMS_SETTINGS_NAV} active="delivery">
        <DeliveryConsole />
      </SettingsLayout>
    </AdminShell>
  );
}
