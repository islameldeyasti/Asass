/**
 * Discover all public SEO targets (static routes + CMS entities).
 */

import {emptyPageSeo} from './model';

const STATIC_PAGES = [
  {path: '', labelEn: 'Home', labelAr: 'الرئيسية', schemaType: 'WebSite'},
  {path: 'about', labelEn: 'About', labelAr: 'عن أساس', schemaType: 'AboutPage'},
  {
    path: 'company-profile',
    labelEn: 'Company Profile',
    labelAr: 'الملف التعريفي',
    schemaType: 'AboutPage',
  },
  {path: 'contact', labelEn: 'Contact', labelAr: 'تواصل', schemaType: 'ContactPage'},
  {path: 'careers', labelEn: 'Careers', labelAr: 'الوظائف', schemaType: ''},
  {path: 'downloads', labelEn: 'Downloads', labelAr: 'التحميلات', schemaType: ''},
  {path: 'projects', labelEn: 'Projects', labelAr: 'المشاريع', schemaType: ''},
  {path: 'services', labelEn: 'Services', labelAr: 'الخدمات', schemaType: ''},
  {path: 'sectors', labelEn: 'Sectors', labelAr: 'القطاعات', schemaType: ''},
  {path: 'blog', labelEn: 'Blog', labelAr: 'المدونة', schemaType: ''},
  {path: 'team', labelEn: 'Team', labelAr: 'الفريق', schemaType: ''},
  {path: 'gallery', labelEn: 'Gallery', labelAr: 'المعرض', schemaType: 'CreativeWork', type: 'gallery'},
  {path: 'portfolio', labelEn: 'Portfolio', labelAr: 'الأعمال', schemaType: ''},
  {
    path: 'project-enquiry',
    labelEn: 'Project Enquiry',
    labelAr: 'استفسار مشروع',
    schemaType: 'ContactPage',
  },
  {path: 'privacy', labelEn: 'Privacy Policy', labelAr: 'سياسة الخصوصية', schemaType: ''},
  {path: 'terms', labelEn: 'Terms of Use', labelAr: 'شروط الاستخدام', schemaType: ''},
];

function targetKey(type, path) {
  return `${type}:${path || 'home'}`;
}

function makeTarget({type = 'page', path = '', labelEn = '', labelAr = '', schemaType = ''}) {
  return emptyPageSeo({
    key: targetKey(type, path),
    type,
    path,
    labelEn,
    labelAr,
    schemaType,
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
  });
}

function labelPair(item, enKeys, arKeys) {
  let labelEn = '';
  let labelAr = '';
  for (const key of enKeys) {
    if (item?.[key]) {
      labelEn = String(item[key]);
      break;
    }
  }
  for (const key of arKeys) {
    if (item?.[key]) {
      labelAr = String(item[key]);
      break;
    }
  }
  return {labelEn, labelAr: labelAr || labelEn};
}

async function safeList(loader) {
  try {
    const items = await loader();
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/**
 * @returns {Promise<ReturnType<typeof emptyPageSeo>[]>}
 */
export async function listSeoTargets() {
  const [
    publicData,
    teamMod,
  ] = await Promise.all([
    import('../public-data'),
    import('@/data/team'),
  ]);

  const [projects, services, sectors, posts, members, jobs] = await Promise.all([
    safeList(publicData.getPublicProjects),
    safeList(publicData.getPublicServices),
    safeList(publicData.getPublicSectors),
    safeList(publicData.getPublicBlogPosts),
    safeList(teamMod.getPublishedTeamMembers),
    safeList(publicData.getPublicJobs),
  ]);

  const openJobs = jobs.filter((job) => job?.status === 'open');

  const staticTargets = STATIC_PAGES.map((page) =>
    makeTarget({
      type: page.type || 'page',
      path: page.path,
      labelEn: page.labelEn,
      labelAr: page.labelAr,
      schemaType: page.schemaType || '',
    }),
  );

  const projectTargets = projects
    .filter((item) => item?.slug)
    .map((item) => {
      const {labelEn, labelAr} = labelPair(item, ['title', 'titleEn', 'name'], ['titleAr', 'nameAr']);
      return makeTarget({
        type: 'project',
        path: `projects/${item.slug}`,
        labelEn,
        labelAr,
        schemaType: 'CreativeWork',
      });
    });

  const serviceTargets = services
    .filter((item) => item?.slug)
    .map((item) => {
      const {labelEn, labelAr} = labelPair(item, ['title', 'titleEn', 'name'], ['titleAr', 'nameAr']);
      return makeTarget({
        type: 'service',
        path: `services/${item.slug}`,
        labelEn,
        labelAr,
        schemaType: 'Service',
      });
    });

  const sectorTargets = sectors
    .filter((item) => item?.slug)
    .map((item) => {
      const {labelEn, labelAr} = labelPair(item, ['title', 'titleEn', 'name'], ['titleAr', 'nameAr']);
      return makeTarget({
        type: 'sector',
        path: `sectors/${item.slug}`,
        labelEn,
        labelAr,
        schemaType: '',
      });
    });

  const blogTargets = posts
    .filter((item) => item?.slug)
    .map((item) => {
      const {labelEn, labelAr} = labelPair(item, ['title', 'titleEn'], ['titleAr']);
      return makeTarget({
        type: 'blog',
        path: `blog/${item.slug}`,
        labelEn,
        labelAr,
        schemaType: 'Article',
      });
    });

  const teamTargets = members
    .filter((item) => item?.slug)
    .map((item) => {
      const {labelEn, labelAr} = labelPair(
        item,
        ['name_en', 'name', 'title', 'titleEn'],
        ['name_ar', 'nameAr', 'titleAr'],
      );
      return makeTarget({
        type: 'team',
        path: `team/${item.slug}`,
        labelEn,
        labelAr,
        schemaType: 'Person',
      });
    });

  const jobTargets = openJobs
    .filter((item) => item?.slug)
    .map((item) => {
      const {labelEn, labelAr} = labelPair(item, ['title', 'titleEn'], ['titleAr']);
      return makeTarget({
        type: 'job',
        path: `careers/${item.slug}`,
        labelEn,
        labelAr,
        schemaType: 'JobPosting',
      });
    });

  return [
    ...staticTargets,
    ...serviceTargets,
    ...projectTargets,
    ...sectorTargets,
    ...blogTargets,
    ...teamTargets,
    ...jobTargets,
  ];
}
