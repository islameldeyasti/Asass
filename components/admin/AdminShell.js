import AdminAppShell, {AdminTopbar} from '@/components/admin/ui/AdminAppShell';
import PageHeader from '@/components/admin/ui/PageHeader';

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
    <div className="cms-app">
      <AdminAppShell user={user} navItems={navItems} />
      <div className="cms-main">
        <AdminTopbar user={user} navItems={navItems} />
        <div className="cms-workspace">
          {title || subtitle || actions || breadcrumb ? (
            <PageHeader title={title} subtitle={subtitle} actions={actions} breadcrumb={breadcrumb} />
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
