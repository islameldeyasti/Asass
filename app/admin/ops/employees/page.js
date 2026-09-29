
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {listUsers} from '@/lib/cms/users-store';
import {listTeamMembers} from '@/lib/team/store';
import AdminShell from '@/components/admin/AdminShell';
import EmployeesManager from '@/components/admin/ops/EmployeesManager';
import {listDepartments} from '@/lib/ops/departments';
import {listEmployees} from '@/lib/ops/employees';

export const dynamic = 'force-dynamic';

export default async function OpsEmployeesPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_EMPLOYEES_READ);
  const [employees, departments, users, teamMembers] = await Promise.all([
    listEmployees(),
    listDepartments({includeInactive: true}),
    listUsers(),
    listTeamMembers({includeDrafts: true}),
  ]);
  const canWrite = hasPermission(session.role, PERMS.OPS_EMPLOYEES_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Employees")}
      subtitle={adminText("Your people, disciplines, expertise and access connections")}
    >
      <EmployeesManager
        initialEmployees={employees}
        departments={departments}
        users={users.map((u) => ({id: u.id, name: u.name, email: u.email, role: u.role}))}
        teamMembers={teamMembers.map((m) => ({id: m.id, name_en: m.name_en}))}
        canWrite={canWrite}
      />
    </AdminShell>
  );
}
