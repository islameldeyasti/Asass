
import {adminText} from '@/lib/admin/translate';
import Link from 'next/link';
import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';
import {
  getBlogPosts,
  getClients,
  getProjects,
  getServices,
  getSectors,
  listApplications,
  listEnquiries,
  listMedia,
} from '@/lib/cms/content-service';
import {listTeamMembers} from '@/lib/team/store';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

function countMissingImages(items = [], keys = ['image', 'cover', 'logo', 'profile_image']) {
  return items.filter((item) => keys.every((key) => !item?.[key])).length;
}

function countDrafts(items = []) {
  return items.filter((item) => item?.status === 'draft').length;
}

export default async function AdminReportsPage() {
  const {user, navItems} = await requireAdminPage(PERMS.DASHBOARD);

  const [
    projects,
    services,
    sectors,
    blog,
    clients,
    team,
    mediaItems,
    enquiries,
    applications,
  ] = await Promise.all([
    getProjects().catch(() => []),
    getServices().catch(() => []),
    getSectors().catch(() => []),
    getBlogPosts().catch(() => []),
    getClients().catch(() => []),
    listTeamMembers({includeDrafts: true}).catch(() => []),
    listMedia().catch(() => []),
    listEnquiries().catch(() => []),
    listApplications().catch(() => []),
  ]);

  const content = {
    drafts:
      countDrafts(projects) +
      countDrafts(services) +
      countDrafts(sectors) +
      countDrafts(blog),
    missingServiceImages: countMissingImages(services, ['image', 'cover']),
    missingSectorImages: countMissingImages(sectors, ['image', 'cover']),
    missingProjectImages: countMissingImages(projects, ['image']),
    missingClientLogos: countMissingImages(clients, ['logo']),
    missingTeamPhotos: team.filter((m) => !m.profile_image).length,
  };

  const mediaMissingAlt = mediaItems.filter(
    (item) => String(item?.mime || '').startsWith('image/') && !item.altEn,
  ).length;

  const cards = [
    {
      title: 'Content health',
      href: '/admin/projects',
      rows: [
        ['Draft items', content.drafts],
        ['Services missing image', content.missingServiceImages],
        ['Sectors missing image', content.missingSectorImages],
        ['Projects missing image', content.missingProjectImages],
        ['Clients missing logo', content.missingClientLogos],
        ['Team missing photo', content.missingTeamPhotos],
      ],
    },
    {
      title: 'SEO',
      href: '/admin/seo',
      rows: [
        ['SEO Control Center', 'Open issues & fix'],
        ['Redirects / sitemap', 'Manage under SEO tabs'],
      ],
    },
    {
      title: 'Media',
      href: '/admin/media',
      rows: [
        ['Library items', mediaItems.length],
        ['Images missing EN alt', mediaMissingAlt],
      ],
    },
    {
      title: 'CRM',
      href: '/admin/crm/enquiries',
      rows: [
        ['Enquiries', enquiries.length],
        ['New / open', enquiries.filter((e) => !e.status || e.status === 'new').length],
      ],
    },
    {
      title: 'Careers',
      href: '/admin/careers/applications',
      rows: [['Applications', applications.length]],
    },
  ];

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Reports")}
      subtitle={adminText("Content, SEO, media, CRM, and careers health")}
    >
      <div style={{display: 'grid', gap: 16}}>
        <div className="cms-card">
          <strong>{adminText("Reports hub")}</strong>
          <p style={{margin: '6px 0 0', color: 'var(--cms-muted)', fontSize: 13}}>{adminText("Live counts from the CMS. Use each card to jump to the module and fix issues.")}</p>
        </div>
        <div className="cms-report-grid">
          {cards.map((card) => (
            <section key={card.title} className="cms-card cms-report-card">
              <header className="cms-report-card-head">
                <h3>{adminText(card.title)}</h3>
              </header>
              <ul className="cms-report-rows">
                {card.rows.map(([label, value]) => (
                  <li key={label}>
                    <span>{adminText(label)}</span>
                    <strong className={typeof value === 'number' && value > 0 && /missing|draft|new|open/i.test(label) ? 'is-warn' : ''}>{adminText(value)}</strong>
                  </li>
                ))}
              </ul>
              <Link className="cms-report-open" href={card.href}>{adminText("Open module")}</Link>
            </section>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
