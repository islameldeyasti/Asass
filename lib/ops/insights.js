import {listAudit} from '@/lib/cms/audit';
import {listApprovals} from './approvals';
import {listAttendance} from './attendance';
import {listClients} from './clients';
import {listDocuments} from './documents';
import {listEmployees} from './employees';
import {listLeaveRequests} from './leave';
import {listMeetings} from './meetings';
import {listProjects} from './projects';
import {listTasks} from './tasks';
import {getWorkloadBoard} from './workload';

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function getOpsInsights({canHr = false} = {}) {
  const [
    employees,
    clients,
    projects,
    tasks,
    documents,
    approvals,
    meetings,
    leavePending,
    leaveApproved,
    audit,
    workload,
  ] = await Promise.all([
    listEmployees(),
    listClients({includeInactive: false}),
    listProjects(),
    listTasks(),
    listDocuments(),
    listApprovals(),
    listMeetings(),
    listLeaveRequests({status: 'pending'}),
    listLeaveRequests({status: 'approved'}),
    listAudit({limit: 80}),
    getWorkloadBoard(),
  ]);

  const day = today();
  const openTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled');
  const overdueTasks = openTasks.filter((t) => t.dueDate && t.dueDate < day);
  const activeProjects = projects.filter((p) => p.status === 'active');
  const pendingApprovals = approvals.filter((a) => a.status === 'pending');
  const onLeave = employees.filter((e) => e.status === 'on_leave');
  const opsAudit = (audit || []).filter((e) => String(e.action || '').startsWith('ops.'));

  let attendanceToday = null;
  if (canHr) {
    const rows = await listAttendance({date: day});
    attendanceToday = {
      total: rows.length,
      present: rows.filter((r) => ['present', 'remote', 'site', 'half_day'].includes(r.type)).length,
      absent: rows.filter((r) => r.type === 'absent').length,
      leave: rows.filter((r) => r.type === 'leave').length,
    };
  }

  return {
    kpis: {
      employees: employees.length,
      activeEmployees: employees.filter((e) => e.status === 'active').length,
      onLeave: onLeave.length,
      clients: clients.length,
      projects: projects.length,
      activeProjects: activeProjects.length,
      openTasks: openTasks.length,
      overdueTasks: overdueTasks.length,
      documents: documents.length,
      meetings: meetings.length,
      pendingApprovals: pendingApprovals.length,
      pendingLeave: leavePending.length,
      approvedLeaveActive: leaveApproved.filter(
        (r) => r.startDate && r.endDate && r.startDate <= day && r.endDate >= day,
      ).length,
      overallocated: workload.summary?.overallocated || 0,
    },
    attendanceToday,
    workloadSummary: workload.summary,
    recentActivity: opsAudit.slice(0, 25),
    attention: {
      overdueTasks: overdueTasks.slice(0, 8).map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate,
        projectId: t.projectId,
      })),
      pendingApprovals: pendingApprovals.slice(0, 8).map((a) => ({
        id: a.id,
        title: a.title,
        projectId: a.projectId,
      })),
      pendingLeave: canHr
        ? leavePending.slice(0, 8).map((r) => ({
            id: r.id,
            employeeId: r.employeeId,
            leaveType: r.leaveType,
            startDate: r.startDate,
            endDate: r.endDate,
            days: r.days,
          }))
        : [],
    },
  };
}

export async function listOpsAudit({q = '', limit = 100} = {}) {
  const entries = await listAudit({limit: 500});
  const query = String(q || '').trim().toLowerCase();
  let items = entries.filter((e) => String(e.action || '').startsWith('ops.'));
  if (query) {
    items = items.filter((e) =>
      [e.action, e.entity, e.entityId, e.actorEmail, e.actorId]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }
  return items.slice(0, Math.max(1, Math.min(Number(limit) || 100, 500)));
}
