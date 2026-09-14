'use client';

import Link from 'next/link';
import {
  Activity,
  FilePlus2,
  FolderKanban,
  ImagePlus,
  MessageSquare,
  Newspaper,
  Settings,
  Users,
} from 'lucide-react';
import EmptyState from '@/components/admin/ui/EmptyState';
import StatusBadge from '@/components/admin/ui/StatusBadge';

function formatWhen(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return String(iso);
  }
}

function activityLabel(entry) {
  const action = entry?.action || 'updated';
  const entity = entry?.entity || 'item';
  return `${action} ${entity}`.replace(/_/g, ' ');
}

export default function DashboardHome({
  stats = [],
  newEnquiries = 0,
  activity = [],
  roleLabel,
}) {
  const quickActions = [
    {label: 'Create project', href: '/admin/projects', icon: FolderKanban},
    {label: 'New blog post', href: '/admin/blog', icon: Newspaper},
    {label: 'Upload media', href: '/admin/media', icon: ImagePlus},
    {label: 'Add team member', href: '/admin/team/new', icon: Users},
    {label: 'Review enquiries', href: '/admin/crm/enquiries', icon: MessageSquare},
    {label: 'Site settings', href: '/admin/settings', icon: Settings},
  ];

  return (
    <div className="cms-stack">
      <div className="cms-stat-grid">
        {stats.map((card) => (
          <Link key={card.label} href={card.href} className="cms-stat-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            {card.hint ? <em>{card.hint}</em> : null}
          </Link>
        ))}
      </div>

      {newEnquiries > 0 ? (
        <div className="cms-card" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16}}>
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6}}>
              <StatusBadge status="new">New</StatusBadge>
              <strong style={{fontSize: 14}}>CRM inbox</strong>
            </div>
            <p style={{margin: 0, color: 'var(--cms-muted)', fontSize: 13}}>
              {newEnquiries} new {newEnquiries === 1 ? 'enquiry' : 'enquiries'} waiting for review.
            </p>
          </div>
          <Link href="/admin/crm/enquiries" className="cms-btn-ghost">
            Open enquiries
          </Link>
        </div>
      ) : null}

      <div className="cms-dash-grid">
        <section className="cms-card">
          <h2 className="cms-dash-section-title">Quick actions</h2>
          <div className="cms-quick-actions">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="cms-quick-action">
                  <Icon aria-hidden />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="cms-card" id="activity">
          <h2 className="cms-dash-section-title">Recent activity</h2>
          {activity.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="Publishing and edits will appear here once audit events are recorded."
            />
          ) : (
            <ul className="cms-activity-list">
              {activity.map((entry) => (
                <li key={entry.id} className="cms-activity-item">
                  <strong>{activityLabel(entry)}</strong>
                  <span>
                    {entry.actorEmail || 'System'}
                    {entry.at ? ` · ${formatWhen(entry.at)}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {roleLabel ? (
        <p style={{margin: 0, color: 'var(--cms-muted)', fontSize: 12}}>
          Signed in as {roleLabel}
        </p>
      ) : null}
    </div>
  );
}
