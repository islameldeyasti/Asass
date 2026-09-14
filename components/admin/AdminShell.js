'use client';

import AdminAppShell from '@/components/admin/ui/AdminAppShell';

/**
 * Thin wrapper so existing admin pages keep importing AdminShell
 * while the redesigned AdminAppShell provides the full CMS chrome.
 */
export default function AdminShell({
  user,
  navItems = [],
  children,
  title,
  subtitle,
  actions,
  breadcrumb,
}) {
  return (
    <AdminAppShell
      user={user}
      navItems={navItems}
      title={title}
      subtitle={subtitle}
      actions={actions}
      breadcrumb={breadcrumb}
    >
      {children}
    </AdminAppShell>
  );
}
