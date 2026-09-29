
import {adminText} from '@/lib/admin/translate';
import Link from 'next/link';
import {Users, FolderKanban, Building2, GitBranch, ClipboardList, ShieldCheck, Network, CalendarDays, Bell, BarChart3, BriefcaseBusiness, Activity} from 'lucide-react';
import {OpsMetrics, OpsSection, OpsEmpty} from '@/components/admin/ops/OpsUI';
import {listTasks} from '@/lib/ops/tasks';
import {listApprovals} from '@/lib/ops/approvals';
import {officeToday, projectHealth} from '@/lib/ops/presentation';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import {listClients} from '@/lib/ops/clients';
import {listDepartments} from '@/lib/ops/departments';
import {listEmployees} from '@/lib/ops/employees';
import {listProjects} from '@/lib/ops/projects';

export const dynamic = 'force-dynamic';

export default async function OpsHomePage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_VIEW);
  const [departments, employees, clients, projects] = await Promise.all([
    listDepartments({includeInactive: false}),
    listEmployees(),
    listClients({includeInactive: false}),
    listProjects(),
  ]);

  const can = (perm) => hasPermission(session.role, perm);
  const [tasks, approvals] = await Promise.all([
    can(PERMS.OPS_TASKS_READ) ? listTasks() : [],
    can(PERMS.OPS_APPROVALS_READ) ? listApprovals({status: 'pending'}) : [],
  ]);
  const today = officeToday();
  const openTasks = tasks.filter(t => !['completed', 'cancelled'].includes(t.status));
  const overdue = openTasks.filter(t => t.dueDate && t.dueDate < today);
  const icons = [BarChart3, Users, Building2, Network, BriefcaseBusiness, FolderKanban, GitBranch, ClipboardList, ShieldCheck, CalendarDays, CalendarDays, Activity, Bell, BarChart3, ShieldCheck];
  const active = employees.filter((e) => e.status === 'active').length;
  const onLeave = employees.filter((e) => e.status === 'on_leave').length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;

  const cards = [
    {
      href: '/admin/ops/dashboard',
      title: 'Ops Dashboard',
      copy: 'KPIs · attention · recent activity',
      perm: PERMS.OPS_VIEW,
    },
    {
      href: '/admin/ops/employees',
      title: 'Employees',
      copy: `${employees.length} profiles · ${active} active`,
      perm: PERMS.OPS_EMPLOYEES_READ,
    },
    {
      href: '/admin/ops/departments',
      title: 'Departments',
      copy: `${departments.length} departments`,
      perm: PERMS.OPS_DEPARTMENTS_READ,
    },
    {
      href: '/admin/ops/org-chart',
      title: 'Org Chart',
      copy: 'Visual structure · open employee from chart',
      perm: PERMS.OPS_EMPLOYEES_READ,
    },
    {
      href: '/admin/ops/clients',
      title: 'Ops Clients',
      copy: `${clients.length} delivery clients`,
      perm: PERMS.OPS_CLIENTS_READ,
    },
    {
      href: '/admin/ops/projects',
      title: 'Ops Projects',
      copy: `${projects.length} projects · ${activeProjects} active`,
      perm: PERMS.OPS_PROJECTS_READ,
    },
    {
      href: '/admin/ops/workflows',
      title: 'Workflows',
      copy: 'Configurable stage templates',
      perm: PERMS.OPS_PROJECTS_READ,
    },
    {
      href: '/admin/ops/tasks',
      title: 'My Tasks',
      copy: 'Lists + Kanban with dependencies',
      perm: PERMS.OPS_TASKS_READ,
    },
    {
      href: '/admin/ops/approvals',
      title: 'Approvals',
      copy: 'Pending decisions across projects',
      perm: PERMS.OPS_APPROVALS_READ,
    },
    {
      href: '/admin/ops/leave',
      title: 'Leave',
      copy: 'Request & approve leave',
      perm: PERMS.OPS_VIEW,
    },
    {
      href: '/admin/ops/attendance',
      title: 'Attendance',
      copy: 'Daily presence (HR)',
      perm: PERMS.OPS_HR_READ,
    },
    {
      href: '/admin/ops/workload',
      title: 'Workload',
      copy: 'Assignment % and capacity',
      perm: PERMS.OPS_EMPLOYEES_READ,
    },
    {
      href: '/admin/ops/notifications',
      title: 'Notifications',
      copy: 'Tasks · approvals · mentions',
      perm: PERMS.OPS_VIEW,
    },
    {
      href: '/admin/ops/reports',
      title: 'Ops Reports',
      copy: 'CSV exports',
      perm: PERMS.OPS_REPORTS,
    },
    {
      href: '/admin/ops/audit',
      title: 'Ops Audit',
      copy: 'Searchable activity trail',
      perm: PERMS.OPS_REPORTS,
    },
  ].filter((c) => hasPermission(session.role, c.perm));

  const metrics = [
    ...(can(PERMS.OPS_PROJECTS_READ) ? [{label: 'Active projects', value: activeProjects, hint: `${projects.length} in the portfolio`, tone: 'good'}] : []),
    ...(can(PERMS.OPS_TASKS_READ) ? [{label: 'Open tasks', value: openTasks.length, hint: 'Across delivery teams'}, {label: 'Overdue tasks', value: overdue.length, hint: 'Past the committed due date', tone: overdue.length ? 'danger' : 'good'}] : []),
    ...(can(PERMS.OPS_APPROVALS_READ) ? [{label: 'Awaiting approval', value: approvals.length, hint: 'Pending review decisions', tone: approvals.length ? 'warning' : ''}] : []),
    ...(can(PERMS.OPS_EMPLOYEES_READ) ? [{label: 'Active employees', value: active, hint: `${onLeave} on leave · ${departments.length} departments`}] : []),
  ];
  return <AdminShell user={user} navItems={navItems} title={adminText("Operations overview")} subtitle={adminText("ASAS Engineering · People, projects and delivery")}>
    <div className="adm-stack">
      <div className="ops-hero"><div><span className="ops-eyebrow">{adminText("Engineering operations / ")}{adminText(today)}</span><h2>{adminText("A clear view of your delivery.")}</h2><p>{adminText("Coordinate your teams, keep projects moving and focus on the decisions that need your attention.")}</p></div><div className="ops-hero-links">{can(PERMS.OPS_PROJECTS_READ) && <Link href="/admin/ops/projects">{adminText("Project portfolio ↗")}</Link>}{can(PERMS.OPS_TASKS_READ) && <Link href="/admin/ops/tasks">{adminText("My work ↗")}</Link>}</div></div>
      <OpsMetrics items={metrics}/>
      <div className="ops-two-col">
        {can(PERMS.OPS_PROJECTS_READ) && <OpsSection eyebrow="Delivery portfolio" title={adminText("Project watchlist")} href="/admin/ops/projects">
          {[...projects].sort((a,b) => Number(projectHealth(b,today).tone === 'danger') - Number(projectHealth(a,today).tone === 'danger')).slice(0,5).map(p => {const health = projectHealth(p,today); return <Link className="ops-register-row" key={p.id} href={`/admin/ops/projects/${p.id}`}><div><strong>{p.nameEn}</strong><small>{adminText(p.code)} · {adminText(employees.find(e=>e.id===p.projectManagerId)?.fullNameEn || 'Manager unassigned')}</small></div><div><span className={`ops-pill ${health.tone}`}>{adminText(health.label)}</span><small>{adminText(p.progress)}{adminText("% complete · ")}{adminText(p.plannedEndDate || 'Set a completion date')}</small></div></Link>})}
          {!projects.length && <OpsEmpty title={adminText("Your portfolio starts here")} description={adminText("Create a project and assign its delivery team.")}/>}
        </OpsSection>}
        <OpsSection eyebrow="Action centre" title={adminText("Needs attention")}>
          {can(PERMS.OPS_TASKS_READ) && <Link className="ops-register-row" href="/admin/ops/tasks"><div><strong>{adminText("Overdue deliverables")}</strong><small>{adminText("Review owners and committed dates")}</small></div><span className={`ops-pill ${overdue.length ? 'danger' : 'good'}`}>{adminText(overdue.length)}</span></Link>}
          {can(PERMS.OPS_APPROVALS_READ) && <Link className="ops-register-row" href="/admin/ops/approvals"><div><strong>{adminText("Review queue")}</strong><small>{adminText("Move pending decisions forward")}</small></div><span className="ops-pill warning">{adminText(approvals.length)}</span></Link>}
          {can(PERMS.OPS_EMPLOYEES_READ) && <Link className="ops-register-row" href="/admin/ops/employees"><div><strong>{adminText("Account connections")}</strong><small>{adminText("Employees without a linked login")}</small></div><span className="ops-pill">{adminText(employees.filter(e=>!e.cmsUserId).length)}</span></Link>}
          {can(PERMS.OPS_DEPARTMENTS_READ) && <Link className="ops-register-row" href="/admin/ops/departments"><div><strong>{adminText("Department leadership")}</strong><small>{adminText("Active departments without a head")}</small></div><span className="ops-pill">{adminText(departments.filter(d=>!d.headEmployeeId).length)}</span></Link>}
        </OpsSection>
      </div>
      <div><span className="ops-eyebrow">{adminText("Your workspace")}</span><h2 style={{fontSize:18,margin:'8px 0 18px'}}>{adminText("Manage your operations")}</h2><div className="ops-module-grid">{cards.map((card,index)=>{const Icon=icons[index] || FolderKanban;return <Link key={card.href} href={card.href} className="ops-module"><span className="ops-module-icon"><Icon size={19}/></span><div><h3>{adminText(card.title)}</h3><p>{adminText(card.copy)}</p></div></Link>})}</div></div>
    </div>
  </AdminShell>;
}
