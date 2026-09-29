
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import NotificationsCenter from '@/components/admin/ops/NotificationsCenter';
import {getEmployeeByCmsUserId} from '@/lib/ops/employees';
import {listNotifications} from '@/lib/ops/notifications';

export const dynamic = 'force-dynamic';

export default async function OpsNotificationsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_VIEW);
  const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
  const byUser = await listNotifications({userId: session.user?.id || null, limit: 100});
  const byEmployee = me?.id
    ? await listNotifications({employeeId: me.id, limit: 100})
    : [];
  const items = Object.values(Object.fromEntries([...byUser, ...byEmployee].map((n) => [n.id, n]))).sort(
    (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
  );
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Notifications")}
      subtitle={adminText("Tasks · approvals · leave · mentions")}
    >
      <NotificationsCenter initialItems={items} initialUnread={unread} />
    </AdminShell>
  );
}
