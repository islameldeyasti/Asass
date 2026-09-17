'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {motion, useReducedMotion} from 'motion/react';
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

const EASE = [0.16, 1, 0.3, 1];

const KPI_ICONS = {
  folder: FolderKanban,
  message: MessageSquare,
  users: Users,
  pulse: HeartPulse,
};

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
  return `${entry?.action || 'updated'} ${entry?.entity || 'item'}`.replace(/_/g, ' ');
}

function useCountUp(target, enabled = true, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setValue(Number(target) || 0);
      return undefined;
    }
    const end = Number(target) || 0;
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(end * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled, duration]);
  return value;
}

function KpiCard({kpi, index, reduceMotion}) {
  const Icon = KPI_ICONS[kpi.icon] || FolderKanban;
  const value = useCountUp(kpi.value, !reduceMotion, 750 + index * 50);
  return (
    <motion.article
      className="rx-kpi"
      initial={reduceMotion ? false : {opacity: 0, y: 16}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.45, delay: 0.05 * index, ease: EASE}}
    >
      <div className="rx-kpi-top">
        <span>{kpi.label}</span>
        <i className="rx-kpi-icon">
          <Icon size={16} />
        </i>
      </div>
      <strong>{value.toLocaleString()}</strong>
      <div className={`rx-trend ${kpi.trendPositive ? 'is-up' : 'is-down'}`}>
        {kpi.trendPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <em>{kpi.trend}</em>
      </div>
      <Link href={kpi.href} className="rx-kpi-link">
        View Details
      </Link>
    </motion.article>
  );
}

function OverviewBars({labels = [], values = [], highlightIndex = 0, total, reduceMotion}) {
  const max = Math.max(1, ...values);
  const [active, setActive] = useState(highlightIndex);

  useEffect(() => {
    setActive(highlightIndex);
  }, [highlightIndex]);

  return (
    <div className="rx-overview">
      <div className="rx-overview-head">
        <div>
          <p className="rx-eyebrow">Activity overview</p>
          <h3>Content & CRM volume</h3>
        </div>
        <div className="rx-overview-total">
          <strong>{Number(total || 0).toLocaleString()}</strong>
          <span className="rx-pill is-up">Live CMS</span>
        </div>
      </div>

      <div className="rx-bars" role="img" aria-label="Monthly activity chart">
        {values.map((value, index) => {
          const height = `${Math.max(8, (value / max) * 100)}%`;
          const isActive = index === active;
          return (
            <button
              key={`${labels[index]}-${index}`}
              type="button"
              className={`rx-bar ${isActive ? 'is-active' : ''}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              aria-label={`${labels[index]}: ${value}`}
            >
              <motion.span
                className="rx-bar-fill"
                initial={reduceMotion ? false : {height: 0}}
                animate={{height}}
                transition={{duration: 0.7, delay: 0.04 * index, ease: EASE}}
              />
              {isActive ? (
                <span className="rx-bar-tip">
                  <b>{labels[index]}</b>
                  <em>{value} events</em>
                </span>
              ) : null}
              <span className="rx-bar-label">{labels[index]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SparkLine({values = [], reduceMotion}) {
  const points = useMemo(() => {
    const max = Math.max(1, ...values);
    const w = 320;
    const h = 96;
    return values
      .map((value, index) => {
        const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * w;
        const y = h - (value / max) * (h - 12) - 6;
        return `${x},${y}`;
      })
      .join(' ');
  }, [values]);

  return (
    <svg className="rx-spark" viewBox="0 0 320 96" preserveAspectRatio="none" aria-hidden>
      <motion.polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={reduceMotion ? false : {pathLength: 0, opacity: 0.2}}
        animate={{pathLength: 1, opacity: 1}}
        transition={{duration: 1, ease: EASE}}
      />
    </svg>
  );
}

function RankList({title, items = [], empty}) {
  return (
    <section className="rx-card rx-list-card">
      <div className="rx-card-head">
        <h3>{title}</h3>
      </div>
      {items.length === 0 ? (
        <EmptyState title={empty} description="Add content to populate this list." />
      ) : (
        <ul className="rx-rank-list">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href || '#'} className="rx-rank-item">
                <span className="rx-rank-thumb">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" />
                  ) : (
                    <em>{String(item.title || '?').slice(0, 1)}</em>
                  )}
                </span>
                <span className="rx-rank-copy">
                  <strong>{item.title}</strong>
                  <small>{item.category}</small>
                </span>
                <b>{item.meta || ''}</b>
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
  const reduceMotion = useReducedMotion();
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
      <motion.header
        className="rx-welcome"
        initial={reduceMotion ? false : {opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.45, ease: EASE}}
      >
        <div>
          <h2>Welcome, {firstName}</h2>
          <p>
            Track content health, enquiry pipeline, and digital card engagement across the ASAS
            platform.
          </p>
        </div>
        <div className="rx-welcome-actions">
          {newEnquiries > 0 ? (
            <Link href="/admin/crm/enquiries" className="rx-btn-soft">
              {newEnquiries} new enquiries
            </Link>
          ) : null}
          <Link href="/admin/reports" className="rx-btn-export">
            <Download size={15} />
            Open reports
          </Link>
        </div>
      </motion.header>

      <div className="rx-kpi-grid">
        {kpis.map((kpi, index) => (
          <KpiCard key={kpi.id} kpi={kpi} index={index} reduceMotion={reduceMotion} />
        ))}
      </div>

      <div className="rx-bento-main">
        <motion.section
          className="rx-card rx-main-chart"
          initial={reduceMotion ? false : {opacity: 0, y: 18}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.12, ease: EASE}}
        >
          <OverviewBars
            labels={overview.labels}
            values={overview.values}
            highlightIndex={reports?.highlightIndex || 0}
            total={overviewTotal}
            reduceMotion={reduceMotion}
          />
          <div className="rx-integrations">
            <span>
              <i /> Projects <b>{publish.published ? publish.published : 0}</b> published mix
            </span>
            <span>
              <i className="is-alt" /> Gallery <b>{publish.gallery || 0}</b> assets
            </span>
            <span>
              <i className="is-soft" /> Videos <b>{publish.videos || 0}</b> films
            </span>
          </div>
        </motion.section>

        <motion.div
          initial={reduceMotion ? false : {opacity: 0, y: 18}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.18, ease: EASE}}
        >
          <RankList
            title="Top projects"
            items={reports?.topProjects || []}
            empty="No projects yet"
          />
        </motion.div>
      </div>

      <div className="rx-bento-bottom">
        <motion.section
          className="rx-card rx-spark-card"
          initial={reduceMotion ? false : {opacity: 0, y: 16}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.2, ease: EASE}}
        >
          <div className="rx-card-head">
            <div>
              <p className="rx-eyebrow">Enquiries trend</p>
              <h3>{Number(publish.enquiries30 || 0).toLocaleString()}</h3>
              <small>Last 30 days · {publish.enquiries7 || 0} in 7 days</small>
            </div>
            <span className={`rx-pill ${Number(reports?.enquiryTrend || 0) >= 0 ? 'is-up' : 'is-down'}`}>
              {Number(reports?.enquiryTrend || 0) >= 0 ? '+' : ''}
              {Number(reports?.enquiryTrend || 0)}% pace
            </span>
          </div>
          <SparkLine values={reports?.spark || []} reduceMotion={reduceMotion} />
        </motion.section>

        <motion.div
          initial={reduceMotion ? false : {opacity: 0, y: 16}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.5, delay: 0.24, ease: EASE}}
        >
          <RankList title="Team card leaders" items={reports?.topTeam || []} empty="No team cards yet" />
        </motion.div>
      </div>

      <div className="rx-bento-tables">
        <motion.section
          className="rx-card"
          initial={reduceMotion ? false : {opacity: 0, y: 14}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.45, delay: 0.22, ease: EASE}}
        >
          <div className="rx-card-head">
            <h3>Health & pipeline table</h3>
            <Link href="/admin/reports" className="rx-text-link">
              Full reports
            </Link>
          </div>
          <div className="rx-table-wrap">
            <table className="rx-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map(([label, value]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>
                      <strong>{value}</strong>
                    </td>
                    <td>
                      <span className={`rx-status ${value > 0 && /missing|draft|new|alt/i.test(label) ? 'is-warn' : 'is-ok'}`}>
                        {value > 0 && /missing|draft|alt/i.test(label) ? 'Needs attention' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        <motion.section
          className="rx-card"
          initial={reduceMotion ? false : {opacity: 0, y: 14}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.45, delay: 0.28, ease: EASE}}
        >
          <div className="rx-card-head">
            <h3>Recent activity</h3>
          </div>
          {activity.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity yet"
              description="Publishing and edits will appear here once audit events are recorded."
            />
          ) : (
            <ul className="rx-activity">
              {activity.map((entry, index) => (
                <motion.li
                  key={entry.id}
                  initial={reduceMotion ? false : {opacity: 0, x: 8}}
                  animate={{opacity: 1, x: 0}}
                  transition={{duration: 0.3, delay: 0.03 * index, ease: EASE}}
                >
                  <strong>{activityLabel(entry)}</strong>
                  <span>
                    {entry.actorEmail || 'System'}
                    {entry.at ? ` · ${formatWhen(entry.at)}` : ''}
                  </span>
                </motion.li>
              ))}
            </ul>
          )}
          {roleLabel ? <p className="rx-role">Signed in as {roleLabel}</p> : null}
        </motion.section>
      </div>
    </div>
  );
}
