import Link from 'next/link';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getSettings} from '@/lib/cms/content-service';
import {normalizeBranding} from '@/lib/cms/branding';
import AdminShell from '@/components/admin/AdminShell';
import BrandingSettingsForm from '@/components/admin/settings/BrandingSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminBrandingSettingsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.SETTINGS_READ);
  const settings = await getSettings();
  const canWrite = hasPermission(session.role, PERMS.SETTINGS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Branding"
      subtitle="Logos, favicon, and social sharing images"
      actions={
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
          <Link className="adm-btn-ghost" href="/admin/settings">
            General
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
      <BrandingSettingsForm
        initialBranding={normalizeBranding(settings?.branding)}
        canWrite={canWrite}
      />
    </AdminShell>
  );
}
