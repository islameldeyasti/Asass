'use client';
import {adminText} from '@/lib/admin/translate';

import Link from 'next/link';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  FolderKanban,
  HeartPulse,
  MessageSquare,
  Users,
} from 'lucide-react';
import EmptyState from '@/components/admin/ui/EmptyState';
import {formatAdminDateTime} from '@/lib/admin/locale';

const KPI_ICONS = {
  folder: FolderKanban,
  message: MessageSquare,
  users: Users,
  pulse: HeartPulse,
};

function formatWhen(iso) {
  return formatAdminDateTime(iso);
}

function activityLabel(entry) {
  return `${entry?.action || 'updated'} ${entry?.entity || 'item'}`.replace(/_/g, ' ');
}

function KpiCard({kpi}) {
  const Icon = KPI_ICONS[kpi.icon] || FolderKanban;
  return (
    <article className="rx-kpi">
      <div className="rx-kpi-top">
        <span>{adminText(kpi.label)}</span>
        <i className="rx-kpi-icon">
          <Icon size={16} />
        </i>
      </div>
      <strong>{adminText(Number(kpi.value || 0).toLocaleString('ar-AE-u-nu-latn'))}</strong>
      <div className={`rx-trend ${kpi.trendPositive ? 'is-up' : 'is-down'}`}>
        {kpi.trendPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <em>{adminText(kpi.trend)}</em>
      </div>
      <Link href={kpi.href} className="rx-kpi-link">{adminText("View Details")}</Link>
    </article>
  );
}

function OverviewBars({labels = [], values = [], highlightIndex = 0, total}) {
  const max = Math.max(1, ...values);
  const active = highlightIndex;

  return (
    <div className="rx-overview">
      <div className="rx-overview-head">
        <div>
          <p className="rx-eyebrow">{adminText("Activity overview")}</p>
          <h3>{adminText("Content & CRM volume")}</h3>
        </div>
        <div className="rx-overview-total">
          <strong>{adminText(Number(total || 0).toLocaleString('ar-AE-u-nu-latn'))}</strong>
          <span className="rx-pill is-up">{adminText("Live CMS")}</span>
        </div>
      </div>

      <div className="rx-bars" role="img" aria-label={adminText("Monthly activity chart")}>
        {values.map((value, index) => {
          const height = `${Math.max(8, (value / max) * 100)}%`;
          const isActive = index === active;
          return (
            <button
              key={`${labels[index]}-${index}`}
              type="button"
              className={`rx-bar ${isActive ? 'is-active' : ''}`}
              aria-label={adminText(`${labels[index]}: ${value}`)}
            >
              <span className="rx-bar-fill" style={{height}} />
              {isActive ? (
                <span className="rx-bar-tip">
                  <b>{adminText(labels[index])}</b>
                  <em>{adminText(value)}{adminText(" events")}</em>
                </span>
              ) : null}
              <span className="rx-bar-label">{adminText(labels[index])}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SparkLine({values = []}) {
  const nums = values.map((v) => Number(v || 0));
  const hasData = nums.some((v) => v > 0);
  if (!hasData) {
    return <p className="rx-spark-empty">{adminText('No enquiry activity in this period yet.')}</p>;
  }
  const max = Math.max(1, ...nums);
  const w = 320;
  const h = 96;
  const points = nums
    .map((value, index) => {
      const x = nums.length <= 1 ? 0 : (index / (nums.length - 1)) * w;
      const y = h - (value / max) * (h - 12) - 6;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="rx-spark" viewBox="0 0 320 96" preserveAspectRatio="none" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

function RankList({title, items = [], empty}) {
  return (
    <section className="rx-card rx-list-card">
      <div className="rx-card-head">
        <h3>{adminText(title)}</h3>
      </div>
      {items.length === 0 ? (
        <EmptyState title={adminText(empty)} description={adminText("Add content to populate this list.")} />
      ) : (
        <ul className="rx-rank-list">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href || '#'} className="rx-rank-item">
                <span className="rx-rank-thumb">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={adminText("")} />
                  ) : (
                    <em>{adminText(String(item.title || '?').slice(0, 1))}</em>
                  )}
                </span>
                <span className="rx-rank-copy">
                  <strong>{adminText(item.title)}</strong>
                  <small>{adminText(item.category)}</small>
                </span>
                <b>{adminText(item.meta || '')}</b>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function DashboardHome({
  firstName = 'Admin',
  kpis = [],
  reports = null,
  newEnquiries = 0,
  activity = [],
  roleLabel,
}) {
  const overview = reports?.overview || {labels: [], values: []};
  const publish = reports?.publish || {};
  const health = reports?.healthIssues || {};
  const pipeline = reports?.pipeline || {};
  const cards = reports?.cards || {};
  const overviewTotal = (overview.values || []).reduce((sum, n) => sum + Number(n || 0), 0);

  const tableRows = [
    ['Draft items', health.drafts || 0],
    ['Projects missing image', health.missingProjectImages || 0],
    ['Services missing image', health.missingServiceImages || 0],
    ['Sectors missing image', health.missingSectorImages || 0],
    ['Clients missing logo', health.missingClientLogos || 0],
    ['Team missing photo', health.missingTeamPhotos || 0],
    ['Images missing EN alt', health.mediaMissingAlt || 0],
    ['CRM new', pipeline.new || 0],
    ['CRM won', pipeline.won || 0],
    ['Card views', cards.views || 0],
    ['vCard downloads', cards.vcardDownloads || 0],
    ['Open roles', publish.openJobs || 0],
  ];

  return (
    <div className="rx-dash">
      <header className="rx-welcome">
        <div>
          <h2>{adminText("Welcome, ")}{adminText(firstName)}</h2>
          <p>{adminText("Track content health, enquiry pipeline, and digital card engagement across the ASAS platform.")}</p>
        </div>
        <div className="rx-welcome-actions">
          {newEnquiries > 0 ? (
            <Link href="/admin/crm/enquiries" className="rx-btn-soft">
              {adminText(newEnquiries)}{adminText(" new enquiries")}</Link>
          ) : null}
          <Link href="/admin/reports" className="rx-btn-export">
            <Download size={15} />{adminText("Open reports")}</Link>
        </div>
      </header>

      <div className="rx-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <div className="rx-bento-main">
        <section className="rx-card rx-main-chart">
          <OverviewBars
            labels={overview.labels}
            values={overview.values}
            highlightIndex={reports?.highlightIndex || 0}
            total={overviewTotal}
          />
          <div className="rx-integrations">
            <span>
              <i />{adminText(" Projects ")}<b>{adminText(publish.published ? publish.published : 0)}</b>{adminText(" published mix")}</span>
            <span>
              <i className="is-alt" />{adminText(" Gallery ")}<b>{adminText(publish.gallery || 0)}</b>{adminText(" assets")}</span>
            <span>
              <i className="is-soft" />{adminText(" Videos ")}<b>{adminText(publish.videos || 0)}</b>{adminText(" films")}</span>
          </div>
        </section>

        <div>
          <RankList
            title={adminText("Top projects")}
            items={reports?.topProjects || []}
            empty="No projects yet"
          />
        </div>
      </div>

      <div className="rx-bento-bottom">
        <section className="rx-card rx-spark-card">
          <div className="rx-card-head">
            <div>
              <p className="rx-eyebrow">{adminText("Enquiries trend")}</p>
              <h3>{adminText(Number(publish.enquiries30 || 0).toLocaleString('ar-AE-u-nu-latn'))}</h3>
              <small>{adminText("Last 30 days · ")}{adminText(publish.enquiries7 || 0)}{adminText(" in 7 days")}</small>
            </div>
            <span className={`rx-pill ${Number(reports?.enquiryTrend || 0) >= 0 ? 'is-up' : 'is-down'}`}>
              {adminText(Number(reports?.enquiryTrend || 0) >= 0 ? '+' : '')}
              {adminText(Number(reports?.enquiryTrend || 0))}{adminText("% pace")}</span>
          </div>
          <SparkLine values={reports?.spark || []} />
        </section>

        <div>
          <RankList title={adminText("Team card leaders")} items={reports?.topTeam || []} empty="No team cards yet" />
        </div>
      </div>

      <div className="rx-bento-tables">
        <section className="rx-card">
          <div className="rx-card-head">
            <h3>{adminText("Health & pipeline table")}</h3>
            <Link href="/admin/reports" className="rx-text-link">{adminText("Full reports")}</Link>
          </div>
          <div className="rx-table-wrap">
            <table className="rx-table">
              <thead>
                <tr>
                  <th>{adminText("Metric")}</th>
                  <th>{adminText("Value")}</th>
                  <th>{adminText("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(([label, value]) => (
                  <tr key={label}>
                    <td>{adminText(label)}</td>
                    <td>
                      <strong>{adminText(value)}</strong>
                    </td>
                    <td>
                      <span className={`rx-status ${value > 0 && /missing|draft|new|alt/i.test(label) ? 'is-warn' : 'is-ok'}`}>
                        {adminText(value > 0 && /missing|draft|alt/i.test(label) ? 'Needs attention' : 'OK')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rx-card">
          <div className="rx-card-head">
            <h3>{adminText("Recent activity")}</h3>
          </div>
          {activity.length === 0 ? (
            <EmptyState
              icon={Activity}
              title={adminText("No activity yet")}
              description={adminText("Publishing and edits will appear here once audit events are recorded.")}
            />
          ) : (
            <ul className="rx-activity">
              {activity.map((entry) => (
                <li key={entry.id}>
                  <strong>{adminText(activityLabel(entry))}</strong>
                  <span>
                    {adminText(entry.actorEmail || 'System')}
                    {entry.at ? ` · ${formatWhen(entry.at)}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {roleLabel ? <p className="rx-role">{adminText("Signed in as ")}{adminText(roleLabel)}</p> : null}
        </section>
      </div>
    </div>
  );
}
