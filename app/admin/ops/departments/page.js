
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import DepartmentsManager from '@/components/admin/ops/DepartmentsManager';
import {listDepartments} from '@/lib/ops/departments';
import {listEmployees} from '@/lib/ops/employees';

export const dynamic = 'force-dynamic';

export default async function OpsDepartmentsPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_DEPARTMENTS_READ);
  const [departments, employees] = await Promise.all([
    listDepartments({includeInactive: true}),
    listEmployees(),
  ]);
  const canWrite = hasPermission(session.role, PERMS.OPS_DEPARTMENTS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Departments")}
      subtitle={adminText("Define organizational units and clear accountability")}
    >
      <DepartmentsManager
        initialDepartments={departments}
        employees={employees}
        canWrite={canWrite}
      />
    </AdminShell>
  );
}
