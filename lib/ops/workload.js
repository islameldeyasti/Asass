import {listEmployees} from './employees';
import {listDepartments} from './departments';
import {listProjectMembers, listProjects} from './projects';
import {listTasks} from './tasks';
import {listLeaveRequests} from './leave';

/**
 * Employee workload view: assignment %, open tasks, leave status.
 * HR / managers use this; not a payroll system.
 */
export async function getWorkloadBoard({departmentId = null} = {}) {
  const [employees, departments, members, projects, tasks, leaveRequests] = await Promise.all([
    listEmployees(),
    listDepartments({includeInactive: true}),
    listProjectMembers(),
    listProjects(),
    listTasks(),
    listLeaveRequests({status: 'approved'}),
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const deptMap = Object.fromEntries(departments.map((d) => [d.id, d]));
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  let people = employees.filter((e) => e.status === 'active' || e.status === 'on_leave');
  if (departmentId) people = people.filter((e) => e.departmentId === departmentId);

  const rows = people.map((emp) => {
    const assignments = members.filter(
      (m) => m.employeeId === emp.id && m.status === 'active',
    );
    const assignedWorkload = assignments.reduce((sum, m) => sum + (Number(m.workloadPercent) || 0), 0);
    const openTasks = tasks.filter(
      (t) =>
        (t.assigneeIds || []).includes(emp.id) &&
        t.status !== 'completed' &&
        t.status !== 'cancelled',
    );
    const overdueTasks = openTasks.filter((t) => t.dueDate && t.dueDate < today);
    const onLeaveNow = leaveRequests.some(
      (r) =>
        r.employeeId === emp.id &&
        r.startDate &&
        r.endDate &&
        r.startDate <= today &&
        r.endDate >= today,
    );
    return {
      employee: emp,
      department: emp.departmentId ? deptMap[emp.departmentId] || null : null,
      assignments: assignments.map((m) => ({
        ...m,
        project: projectMap[m.projectId] || null,
      })),
      assignedWorkload,
      openTasks: openTasks.length,
      overdueTasks: overdueTasks.length,
      projectCount: assignments.length,
      onLeaveNow: onLeaveNow || emp.status === 'on_leave',
      capacityLabel:
        assignedWorkload > 100 ? 'overallocated' : assignedWorkload >= 80 ? 'heavy' : assignedWorkload >= 40 ? 'balanced' : 'available',
    };
  });

  rows.sort((a, b) => b.assignedWorkload - a.assignedWorkload || a.employee.fullNameEn.localeCompare(b.employee.fullNameEn));

  return {
    rows,
    summary: {
      people: rows.length,
      overallocated: rows.filter((r) => r.capacityLabel === 'overallocated').length,
      onLeave: rows.filter((r) => r.onLeaveNow).length,
      withOverdue: rows.filter((r) => r.overdueTasks > 0).length,
    },
  };
}
