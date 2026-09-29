
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import MyTasksBoard from '@/components/admin/ops/MyTasksBoard';
import {getEmployeeByCmsUserId, listEmployees} from '@/lib/ops/employees';
import {listProjects} from '@/lib/ops/projects';
import {enrichTasks, getMyTasksBoard} from '@/lib/ops/tasks';

export const dynamic = 'force-dynamic';

export default async function OpsTasksPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_TASKS_READ);
  const employees = await listEmployees();
  const me = session.user?.id ? await getEmployeeByCmsUserId(session.user.id) : null;
  const board = await getMyTasksBoard({assigneeId: me?.id || null});
  const projects = await listProjects();
  const enrichBucket = (list) => enrichTasks(list, {projects, employees});
  const initialBoard = {
    ...board,
    assigneeId: me?.id || null,
    buckets: Object.fromEntries(
      Object.entries(board.buckets).map(([key, list]) => [key, enrichBucket(list)]),
    ),
    kanban: Object.fromEntries(
      Object.entries(board.kanban).map(([key, list]) => [key, enrichBucket(list)]),
    ),
  };
  const canWrite = hasPermission(session.role, PERMS.OPS_TASKS_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("My Tasks")}
      subtitle={adminText("Plan, assign and track delivery across your projects")}
    >
      <MyTasksBoard
        initialBoard={initialBoard}
        employees={employees}
        projects={projects}
        canWrite={canWrite}
        currentEmployeeId={me?.id || null}
      />
    </AdminShell>
  );
}
