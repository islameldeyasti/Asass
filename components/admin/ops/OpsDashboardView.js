'use client';
import {adminText} from '@/lib/admin/translate';


import Link from 'next/link';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {formatAdminDateTime} from '@/lib/admin/locale';

export default function OpsDashboardView({insights, canHr = false}) {
  const kpis = insights?.kpis || {};
  const attention = insights?.attention || {};
  const activity = insights?.recentActivity || [];
  const attendance = insights?.attendanceToday;

  const cards = [
    {label: 'Active projects', value: kpis.activeProjects, href: '/admin/ops/projects'},
    {label: 'Open tasks', value: kpis.openTasks, href: '/admin/ops/tasks'},
    {label: 'Overdue tasks', value: kpis.overdueTasks, href: '/admin/ops/tasks'},
    {label: 'Pending approvals', value: kpis.pendingApprovals, href: '/admin/ops/approvals'},
    {label: 'Documents', value: kpis.documents, href: '/admin/ops/projects'},
    {label: 'Meetings', value: kpis.meetings, href: '/admin/ops/projects'},
    {label: 'Employees', value: kpis.activeEmployees, href: '/admin/ops/employees'},
    {label: 'On leave', value: kpis.onLeave, href: '/admin/ops/leave'},
    {label: 'Overallocated', value: kpis.overallocated, href: '/admin/ops/workload'},
  ];
  if (canHr) {
    cards.push({label: 'Pending leave', value: kpis.pendingLeave, href: '/admin/ops/leave'});
  }

  return (
    <div className="adm-stack">
      <div className="ops-metrics">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="ops-metric">
            <span>{adminText(card.label)}</span>
            <strong>{card.value ?? 0}</strong>
          </Link>
        ))}
      </div>

      {attendance ? (
        <section className="adm-card">
          <h2 className="adm-section-title" style={{marginTop: 0}}>{adminText("Attendance today")}</h2>
          <p className="adm-section-help" style={{marginBottom: 0}}>
            {adminText(attendance.present)}{adminText(" present/remote/site · ")}{adminText(attendance.absent)}{adminText(" absent · ")}{adminText(attendance.leave)}{adminText(' ')}{adminText("leave · ")}{adminText(attendance.total)}{adminText(" records ·")}{adminText(' ')}
            <Link href="/admin/ops/attendance">{adminText("Open attendance")}</Link>
          </p>
        </section>
      ) : null}

      <div className="adm-grid-2">
        <section className="adm-card">
          <h2 className="adm-section-title" style={{marginTop: 0}}>{adminText("Needs attention")}</h2>
          <h3 className="adm-section-help">{adminText("Overdue tasks")}</h3>
          <ul className="ops-360-list">
            {(attention.overdueTasks || []).map((t) => (
              <li key={t.id}>
                {t.projectId ? (
                  <Link href={`/admin/ops/projects/${t.projectId}`}>{adminText(t.title)}</Link>
                ) : (
                  t.title
                )}{adminText(' ')}
                <span style={{color: 'var(--cms-muted)'}}>{adminText("due ")}{adminText(t.dueDate)}</span>
              </li>
            ))}
            {!attention.overdueTasks?.length ? <li>{adminText("None")}</li> : null}
          </ul>
          <h3 className="adm-section-help">{adminText("Pending approvals")}</h3>
          <ul className="ops-360-list">
            {(attention.pendingApprovals || []).map((a) => (
              <li key={a.id}>
                {a.projectId ? (
                  <Link href={`/admin/ops/projects/${a.projectId}`}>{adminText(a.title)}</Link>
                ) : (
                  a.title
                )}
              </li>
            ))}
            {!attention.pendingApprovals?.length ? <li>{adminText("None")}</li> : null}
          </ul>
          {canHr ? (
            <>
              <h3 className="adm-section-help">{adminText("Pending leave")}</h3>
              <ul className="ops-360-list">
                {(attention.pendingLeave || []).map((r) => (
                  <li key={r.id}>
                    {adminText(r.leaveType)} · {adminText(r.startDate)} → {adminText(r.endDate)} ({adminText(r.days)}{adminText("d)")}</li>
                ))}
                {!attention.pendingLeave?.length ? <li>{adminText("None")}</li> : null}
              </ul>
            </>
          ) : null}
        </section>

        <section className="adm-card">
          <h2 className="adm-section-title" style={{marginTop: 0}}>{adminText("Recent ops activity")}</h2>
          <ul className="ops-360-list">
            {activity.map((row) => (
              <li key={row.id}>
                <StatusBadge status="info">{adminText(row.action)}</StatusBadge>{adminText(' ')}
                <span style={{color: 'var(--cms-muted)', fontSize: 12}}>
                  {adminText(row.actorEmail || 'system')} · {row.at ? formatAdminDateTime(row.at) : ''}
                </span>
              </li>
            ))}
            {!activity.length ? (
              <li style={{color: 'var(--cms-muted)'}}>{adminText("No ops audit entries yet.")}</li>
            ) : null}
          </ul>
          <p style={{marginBottom: 0}}>
            <Link href="/admin/ops/audit">{adminText("Search full audit →")}</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
