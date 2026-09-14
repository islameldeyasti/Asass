import {Suspense} from 'react';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getSeoSettings} from '@/lib/cms/seo-store';
import AdminShell from '@/components/admin/AdminShell';
import SeoControlCenter from '@/components/admin/seo/SeoControlCenter';

export const dynamic = 'force-dynamic';

export default async function AdminSeoPage({searchParams}) {
  const {user, navItems, session} = await requireAdminPage(PERMS.SEO_READ);
  const settings = await getSeoSettings();
  const canWrite = hasPermission(session.role, PERMS.SEO_WRITE);
  const canWriteRedirects = hasPermission(session.role, PERMS.REDIRECTS_WRITE);
  const params = await searchParams;
  const initialTab = typeof params?.tab === 'string' ? params.tab : 'overview';

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="SEO Control Center"
      subtitle="Page metadata, redirects, sitemap, and robots for the public site"
    >
      <Suspense
        fallback={
          <div className="cms-card">
            <p style={{margin: 0, color: 'var(--cms-muted)'}}>Loading SEO Control Center…</p>
          </div>
        }
      >
        <SeoControlCenter
          canWrite={canWrite}
          canWriteRedirects={canWriteRedirects}
          initialSettings={settings}
          initialTab={initialTab}
        />
      </Suspense>
    </AdminShell>
  );
}
