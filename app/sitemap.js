import {
  getPublicBlogPosts,
  getPublicJobs,
  getPublicProjects,
  getPublicSectors,
  getPublicServices,
} from '@/lib/cms/public-data';
import {getAllPageSeo, ensurePageSeoSeeded} from '@/lib/cms/seo/page-seo-store';
import {getSeoSettings} from '@/lib/cms/seo-store';

const STATIC_ROUTES = [
  '',
  'about',
  'services',
  'projects',
  'gallery',
  'portfolio',
  'sectors',
  'blog',
  'team',
  'careers',
  'downloads',
  'contact',
  'project-enquiry',
  'company-profile',
  'privacy',
  'terms',
];

function joinUrl(base, locale, route) {
  const root = String(base || 'https://www.asasengg.ae').replace(/\/$/, '');
  const path = route ? `/${locale}/${route}` : `/${locale}`;
  return `${root}${path}`;
}

export default async function sitemap() {
  await ensurePageSeoSeeded().catch(() => null);
  const [settings, seoDoc, projects, services, sectors, posts, jobs] = await Promise.all([
    getSeoSettings(),
    getAllPageSeo(),
    getPublicProjects().catch(() => []),
    getPublicServices().catch(() => []),
    getPublicSectors().catch(() => []),
    getPublicBlogPosts().catch(() => []),
    getPublicJobs().catch(() => []),
  ]);

  let teamMembers = [];
  try {
    const {getPublishedTeamMembers} = await import('@/data/team');
    teamMembers = await getPublishedTeamMembers();
  } catch {
    teamMembers = [];
  }

  const entries = seoDoc?.entries || {};
  const base = settings.canonicalBase || 'https://www.asasengg.ae';

  const detailRoutes = [
    ...services.map((item) => ({path: `services/${item.slug}`, key: `service:services/${item.slug}`})),
    ...projects.map((item) => ({path: `projects/${item.slug}`, key: `project:projects/${item.slug}`})),
    ...sectors.map((item) => ({path: `sectors/${item.slug}`, key: `sector:sectors/${item.slug}`})),
    ...posts.map((item) => ({path: `blog/${item.slug}`, key: `blog:blog/${item.slug}`})),
    ...teamMembers.map((item) => ({path: `team/${item.slug}`, key: `team:team/${item.slug}`})),
    ...jobs
      .filter((item) => item.status === 'open' || !item.status)
      .map((item) => ({path: `careers/${item.slug}`, key: `job:careers/${item.slug}`})),
  ];

  const staticMapped = STATIC_ROUTES.map((path) => ({
    path,
    key: `page:${path || 'home'}`,
  }));

  const all = [...staticMapped, ...detailRoutes];

  return ['en', 'ar'].flatMap((locale) =>
    all
      .filter(({key}) => {
        const seo = entries[key];
        if (seo && seo.sitemapInclude === false) return false;
        if (seo && seo.robotsIndex === false) return false;
        return true;
      })
      .map(({path}) => ({
        url: joinUrl(base, locale, path),
        lastModified: new Date(),
      })),
  );
}
