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
      title="Reports"
      subtitle="Content, SEO, media, CRM, and careers health"
    >
      <div style={{display: 'grid', gap: 16}}>
        <div className="cms-card">
          <strong>Reports hub</strong>
          <p style={{margin: '6px 0 0', color: 'var(--cms-muted)', fontSize: 13}}>
            Live counts from the CMS. Use each card to jump to the module and fix issues.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 12,
          }}
        >
          {cards.map((card) => (
            <section key={card.title} className="cms-card" style={{display: 'grid', gap: 10}}>
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 8}}>
                <strong>{card.title}</strong>
                <Link className="adm-btn-ghost" href={card.href}>
                  Open
                </Link>
              </div>
              <ul style={{margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6}}>
                {card.rows.map(([label, value]) => (
                  <li
                    key={label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                      fontSize: 13,
                    }}
                  >
                    <span style={{color: 'var(--cms-muted)'}}>{label}</span>
                    <strong>{value}</strong>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
