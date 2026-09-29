import {listApprovals} from './approvals';
import {listAttendance} from './attendance';
import {listClients} from './clients';
import {listEmployees} from './employees';
import {listLeaveRequests} from './leave';
import {listProjects, listProjectMembers} from './projects';
import {listTasks} from './tasks';
import {getWorkloadBoard} from './workload';

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(headers, rows) {
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

export async function buildOpsReport(type) {
  const day = new Date().toISOString().slice(0, 10);

  if (type === 'projects') {
    const [projects, clients] = await Promise.all([listProjects(), listClients()]);
    const clientMap = Object.fromEntries(clients.map((c) => [c.id, c.nameEn]));
    const headers = ['code', 'nameEn', 'status', 'priority', 'client', 'progress', 'startDate', 'plannedEndDate'];
    const rows = projects.map((p) => ({
      code: p.code,
      nameEn: p.nameEn,
      status: p.status,
      priority: p.priority,
      client: clientMap[p.clientId] || '',
      progress: p.progress ?? '',
      startDate: p.startDate || '',
      plannedEndDate: p.plannedEndDate || '',
    }));
    return {filename: `ops-projects-${day}.csv`, csv: toCsv(headers, rows), count: rows.length};
  }

  if (type === 'tasks') {
    const [tasks, projects, employees] = await Promise.all([
      listTasks(),
      listProjects(),
      listEmployees(),
    ]);
    const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.code]));
    const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn]));
    const headers = ['title', 'project', 'status', 'priority', 'assignees', 'dueDate', 'progress'];
    const rows = tasks.map((t) => ({
      title: t.title,
      project: projectMap[t.projectId] || '',
      status: t.status,
      priority: t.priority,
      assignees: (t.assigneeIds || []).map((id) => empMap[id] || id).join('; '),
      dueDate: t.dueDate || '',
      progress: t.progress ?? '',
    }));
    return {filename: `ops-tasks-${day}.csv`, csv: toCsv(headers, rows), count: rows.length};
  }

  if (type === 'employees') {
    const employees = await listEmployees();
    const headers = ['employeeCode', 'fullNameEn', 'jobTitleEn', 'email', 'status', 'joiningDate'];
    const rows = employees.map((e) => ({
      employeeCode: e.employeeCode || '',
      fullNameEn: e.fullNameEn,
      jobTitleEn: e.jobTitleEn || '',
      email: e.email || '',
      status: e.status,
      joiningDate: e.joiningDate || '',
    }));
    return {filename: `ops-employees-${day}.csv`, csv: toCsv(headers, rows), count: rows.length};
  }

  if (type === 'leave') {
    const [requests, employees] = await Promise.all([listLeaveRequests(), listEmployees()]);
    const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn]));
    const headers = ['employee', 'leaveType', 'startDate', 'endDate', 'days', 'status', 'reason'];
    const rows = requests.map((r) => ({
      employee: empMap[r.employeeId] || r.employeeId || '',
      leaveType: r.leaveType,
      startDate: r.startDate || '',
      endDate: r.endDate || '',
      days: r.days,
      status: r.status,
      reason: r.reason || '',
    }));
    return {filename: `ops-leave-${day}.csv`, csv: toCsv(headers, rows), count: rows.length};
  }

  if (type === 'attendance') {
    const [rowsRaw, employees] = await Promise.all([listAttendance(), listEmployees()]);
    const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn]));
    const headers = ['date', 'employee', 'type', 'checkIn', 'checkOut', 'notes'];
    const rows = rowsRaw.map((r) => ({
      date: r.date || '',
      employee: empMap[r.employeeId] || r.employeeId || '',
      type: r.type,
      checkIn: r.checkIn || '',
      checkOut: r.checkOut || '',
      notes: r.notes || '',
    }));
    return {filename: `ops-attendance-${day}.csv`, csv: toCsv(headers, rows), count: rows.length};
  }

  if (type === 'approvals') {
    const items = await listApprovals();
    const headers = ['title', 'projectId', 'subjectType', 'status', 'steps', 'updatedAt'];
    const rows = items.map((a) => ({
      title: a.title,
      projectId: a.projectId || '',
      subjectType: a.subjectType,
      status: a.status,
      steps: (a.steps || []).length,
      updatedAt: a.updatedAt || '',
    }));
    return {filename: `ops-approvals-${day}.csv`, csv: toCsv(headers, rows), count: rows.length};
  }

  if (type === 'workload') {
    const board = await getWorkloadBoard();
    const headers = [
      'employee',
      'department',
      'assignedWorkload',
      'projectCount',
      'openTasks',
      'overdueTasks',
      'capacity',
      'onLeaveNow',
    ];
    const rows = (board.rows || []).map((r) => ({
      employee: r.employee?.fullNameEn || '',
      department: r.department?.nameEn || '',
      assignedWorkload: r.assignedWorkload,
      projectCount: r.projectCount,
      openTasks: r.openTasks,
      overdueTasks: r.overdueTasks,
      capacity: r.capacityLabel,
      onLeaveNow: r.onLeaveNow ? 'yes' : 'no',
    }));
    return {filename: `ops-workload-${day}.csv`, csv: toCsv(headers, rows), count: rows.length};
  }

  if (type === 'team-assignments') {
    const [members, projects, employees] = await Promise.all([
      listProjectMembers(),
      listProjects(),
      listEmployees(),
    ]);
    const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.code]));
    const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn]));
    const headers = ['project', 'employee', 'projectRole', 'workloadPercent', 'status'];
    const rows = members.map((m) => ({
      project: projectMap[m.projectId] || m.projectId || '',
      employee: empMap[m.employeeId] || m.employeeId || '',
      projectRole: m.projectRole || '',
      workloadPercent: m.workloadPercent ?? '',
      status: m.status || '',
    }));
    return {filename: `ops-team-assignments-${day}.csv`, csv: toCsv(headers, rows), count: rows.length};
  }

  const error = new Error('Unknown report type');
  error.status = 400;
  throw error;
}

export const OPS_REPORT_TYPES = [
  {value: 'projects', label: 'Projects', needsHr: false},
  {value: 'tasks', label: 'Tasks', needsHr: false},
  {value: 'team-assignments', label: 'Team assignments', needsHr: false},
  {value: 'approvals', label: 'Approvals', needsHr: false},
  {value: 'workload', label: 'Workload', needsHr: false},
  {value: 'employees', label: 'Employees', needsHr: true},
  {value: 'leave', label: 'Leave', needsHr: true},
  {value: 'attendance', label: 'Attendance', needsHr: true},
];
