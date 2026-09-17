import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS, ROLE_LABELS} from '@/lib/cms/permissions';
import {listTeamMembers} from '@/lib/team/store';
import {listUsers} from '@/lib/cms/users-store';
import {listAudit} from '@/lib/cms/audit';
import {normalizeDigitalCard} from '@/lib/cms/corporate/employee-cards';
import {
  getBlogPosts,
  getClients,
  getGalleryItems,
  getJobs,
  getProjects,
  getSectors,
  getServices,
  getTestimonials,
  getVideos,
  listApplications,
  listEnquiries,
  listMedia,
} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import DashboardHome from '@/components/admin/ui/DashboardHome';

export const dynamic = 'force-dynamic';

function isDraft(item) {
  return String(item?.status || '').toLowerCase() === 'draft';
}

function isPublished(item) {
  const status = String(item?.status || 'published').toLowerCase();
  return status === 'published' || status === 'open' || status === '';
}

function countMissing(items = [], keys = []) {
  return items.filter((item) => keys.every((key) => !item?.[key])).length;
}

function daysAgo(n) {
  return Date.now() - n * 24 * 60 * 60 * 1000;
}

function itemDate(item) {
  const raw = item?.createdAt || item?.updatedAt || item?.submittedAt || item?.date;
  const ts = raw ? Date.parse(raw) : NaN;
  return Number.isFinite(ts) ? ts : 0;
}

function monthBuckets(items = [], dateFn = itemDate) {
  const now = new Date();
  const labels = [];
  const values = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(d.toLocaleString('en', {month: 'short'}));
    const start = d.getTime();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
    values.push(items.filter((item) => {
      const ts = dateFn(item);
      return ts >= start && ts < end;
    }).length);
  }
  return {labels, values};
}

export default async function AdminDashboardPage() {
  const {user, navItems} = await requireAdminPage(PERMS.DASHBOARD);
  const [
    members,
    users,
    posts,
    projects,
    services,
    sectors,
    clients,
    testimonials,
    gallery,
    videos,
    jobs,
    enquiries,
    applications,
    media,
    activity,
  ] = await Promise.all([
    listTeamMembers({includeDrafts: true}).catch(() => []),
    listUsers().catch(() => []),
    getBlogPosts().catch(() => []),
    getProjects().catch(() => []),
    getServices().catch(() => []),
    getSectors().catch(() => []),
    getClients().catch(() => []),
    getTestimonials().catch(() => []),
    getGalleryItems().catch(() => []),
    getVideos().catch(() => []),
    getJobs().catch(() => []),
    listEnquiries().catch(() => []),
    listApplications().catch(() => []),
    listMedia().catch(() => []),
    listAudit({limit: 14}).catch(() => []),
  ]);

  const newEnquiries = enquiries.filter(
    (item) => String(item?.status || 'new').toLowerCase() === 'new',
  ).length;
  const openJobs = jobs.filter((job) => String(job.status || '').toLowerCase() === 'open').length;
  const since30 = daysAgo(30);
  const since7 = daysAgo(7);
  const enquiries30 = enquiries.filter((item) => itemDate(item) >= since30).length;
  const enquiries7 = enquiries.filter((item) => itemDate(item) >= since7).length;
  const applications30 = applications.filter((item) => itemDate(item) >= since30).length;

  const pipeline = {
    new: 0,
    contacted: 0,
    qualified: 0,
    proposal: 0,
    won: 0,
    lost: 0,
    spam: 0,
    other: 0,
  };
  for (const item of enquiries) {
    const status = String(item?.status || 'new').toLowerCase();
    if (status in pipeline) pipeline[status] += 1;
    else pipeline.other += 1;
  }

  const draftTotal =
    projects.filter(isDraft).length +
    posts.filter(isDraft).length +
    services.filter(isDraft).length +
    sectors.filter(isDraft).length +
    videos.filter(isDraft).length;

  const publishedTotal =
    projects.filter(isPublished).length +
    posts.filter(isPublished).length +
    services.filter(isPublished).length +
    sectors.filter(isPublished).length +
    videos.filter((item) => !isDraft(item)).length;

  const healthIssues = {
    drafts: draftTotal,
    missingProjectImages: countMissing(projects, ['image', 'cover', 'heroImage']),
    missingServiceImages: countMissing(services, ['image', 'cover']),
    missingSectorImages: countMissing(sectors, ['image', 'cover']),
    missingClientLogos: countMissing(clients, ['logo']),
    missingTeamPhotos: members.filter((member) => !member.profile_image).length,
    mediaMissingAlt: media.filter(
      (item) => String(item?.mime || '').startsWith('image/') && !item.altEn,
    ).length,
  };
  const healthIssueTotal = Object.values(healthIssues).reduce((sum, n) => sum + Number(n || 0), 0);
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - healthIssueTotal * 3)));

  const cardTotals = members.reduce(
    (acc, member) => {
      const card = normalizeDigitalCard(member?.digital_card);
      if (!(card.enabled && card.status === 'published')) return acc;
      acc.published += 1;
      acc.views += Number(card.views) || 0;
      acc.vcardDownloads += Number(card.vcardDownloads) || 0;
      acc.callClicks += Number(card.callClicks) || 0;
      acc.emailClicks += Number(card.emailClicks) || 0;
      return acc;
    },
    {published: 0, views: 0, vcardDownloads: 0, callClicks: 0, emailClicks: 0},
  );

  const contentTotal =
    projects.length +
    posts.length +
    services.length +
    sectors.length +
    gallery.length +
    videos.length;

  const enquiryTrend =
    enquiries30 === 0 ? 0 : Math.round(((enquiries7 * (30 / 7) - enquiries30) / Math.max(enquiries30, 1)) * 100);

  const kpis = [
    {
      id: 'content',
      label: 'Total content',
      value: contentTotal,
      trend: publishedTotal ? `+${Math.min(99, Math.round((publishedTotal / contentTotal) * 100))}% published` : 'No publish mix yet',
      trendPositive: true,
      href: '/admin/projects',
      icon: 'folder',
    },
    {
      id: 'enquiries',
      label: 'Enquiries',
      value: enquiries.length,
      trend: newEnquiries ? `${newEnquiries} new waiting` : `${enquiries30} in last 30 days`,
      trendPositive: newEnquiries === 0,
      href: '/admin/crm/enquiries',
      icon: 'message',
    },
    {
      id: 'cards',
      label: 'Card views',
      value: cardTotals.views,
      trend: `${cardTotals.published} published cards`,
      trendPositive: true,
      href: '/admin/corporate/employee-cards',
      icon: 'users',
    },
    {
      id: 'health',
      label: 'Health score',
      value: healthScore,
      trend: healthIssueTotal ? `${healthIssueTotal} issues` : 'All clear',
      trendPositive: healthIssueTotal === 0,
      href: '/admin/reports',
      icon: 'pulse',
    },
  ];

  const overview = monthBuckets([...enquiries, ...applications, ...activity]);
  const highlightIndex = overview.values.indexOf(Math.max(...overview.values, 0));

  const topProjects = [...projects]
    .sort((a, b) => itemDate(b) - itemDate(a))
    .slice(0, 6)
    .map((project) => ({
      id: project.id || project.slug,
      title: project.title || project.name || project.slug,
      category: project.category || project.sector || 'Project',
      image: project.image || project.cover || project.heroImage || '',
      href: '/admin/projects',
    }));

  const topTeam = [...members]
    .map((member) => {
      const card = normalizeDigitalCard(member.digital_card);
      const views = Number(card.views) || 0;
      return {
        id: member.id,
        title: member.name_en || member.name || 'Team member',
        category: member.job_title_en || member.department_en || 'Team',
        image: member.profile_image || '',
        meta: `${views} views`,
        views,
        href: `/admin/team/${member.id}`,
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  const spark = monthBuckets(enquiries).values;

  const reports = {
    healthScore,
    healthIssues,
    healthIssueTotal,
    pipeline,
    publish: {
      published: publishedTotal,
      drafts: draftTotal,
      testimonials: testimonials.length,
      applications: applications.length,
      applications30,
      enquiries30,
      enquiries7,
      clients: clients.length,
      media: media.length,
      users: users.length,
      openJobs,
      videos: videos.length,
      gallery: gallery.length,
      services: services.length,
      sectors: sectors.length,
      blog: posts.length,
      team: members.length,
    },
    cards: cardTotals,
    overview,
    highlightIndex: highlightIndex < 0 ? 0 : highlightIndex,
    spark,
    topProjects,
    topTeam,
    enquiryTrend,
  };

  const firstName =
    String(user?.name || '')
      .trim()
      .split(/\s+/)[0] || 'Admin';

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Dashboard"
      subtitle="Analytics overview for content, CRM, and digital cards"
    >
      <DashboardHome
        firstName={firstName}
        kpis={kpis}
        reports={reports}
        newEnquiries={newEnquiries}
        activity={activity}
        roleLabel={ROLE_LABELS[user.role] || user.role}
      />
    </AdminShell>
  );
}
