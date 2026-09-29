
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import AttendanceManager from '@/components/admin/ops/AttendanceManager';
import {listAttendance, summarizeAttendance} from '@/lib/ops/attendance';
import {listEmployees} from '@/lib/ops/employees';
import {listProjects} from '@/lib/ops/projects';

export const dynamic = 'force-dynamic';

export default async function OpsAttendancePage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_HR_READ);
  const today = new Date().toISOString().slice(0, 10);
  const [items, employees, projects] = await Promise.all([
    listAttendance({date: today}),
    listEmployees(),
    listProjects(),
  ]);
  const canWrite = hasPermission(session.role, PERMS.OPS_HR_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Attendance")}
      subtitle={adminText("Daily presence · site / remote · HR only")}
    >
      <AttendanceManager
        initialItems={items}
        initialSummary={summarizeAttendance(items)}
        employees={employees}
        projects={projects}
        canWrite={canWrite}
      />
    </AdminShell>
  );
}
