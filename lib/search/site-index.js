import {projects} from '@/data/projects';
import {services} from '@/data/services';
import {sectors} from '@/data/sectors';
import {jobs} from '@/data/careers';
import {getPosts} from '@/data/blog';

const PAGES = [
  {
    id: 'page-home',
    type: 'page',
    title: 'Home',
    titleAr: 'الرئيسية',
    excerpt: 'ASAS Engineering & Project Management Consultancy — Abu Dhabi.',
    excerptAr: 'أساس للاستشارات الهندسية وإدارة المشاريع — أبوظبي.',
    path: '',
    keywords: 'home asas engineering consultancy abu dhabi أساس هندسة',
  },
  {
    id: 'page-about',
    type: 'page',
    title: 'About ASAS',
    titleAr: 'عن أساس',
    excerpt: 'Company overview, values and engineering consultancy profile.',
    excerptAr: 'نظرة عامة على الشركة والقيم والملف الاستشاري الهندسي.',
    path: 'about',
    keywords: 'about company profile values أساس عن الشركة',
  },
  {
    id: 'page-company',
    type: 'page',
    title: 'Company Profile',
    titleAr: 'ملف الشركة',
    excerpt: 'Official company profile and capabilities.',
    excerptAr: 'الملف الرسمي للشركة وقدراتها.',
    path: 'company-profile',
    keywords: 'company profile corporate أساس ملف الشركة',
  },
  {
    id: 'page-gallery',
    type: 'page',
    title: 'Gallery',
    titleAr: 'المعرض',
    excerpt: 'Visual archive of ASAS projects and spaces.',
    excerptAr: 'أرشيف بصري لمشاريع وفضاءات أساس.',
    path: 'gallery',
    keywords: 'gallery photos images architecture interiors معرض صور',
  },
  {
    id: 'page-team',
    type: 'page',
    title: 'Our Team',
    titleAr: 'فريقنا',
    excerpt: 'Meet the ASAS engineering and consultancy team.',
    excerptAr: 'تعرّف على فريق أساس الهندسي والاستشاري.',
    path: 'team',
    keywords: 'team people experts engineers فريق',
  },
  {
    id: 'page-services',
    type: 'page',
    title: 'Services',
    titleAr: 'الخدمات',
    excerpt: 'Architecture, structural, MEP, QS, project management and more.',
    excerptAr: 'العمارة والإنشاءات وMEP وحصر الكميات وإدارة المشاريع والمزيد.',
    path: 'services',
    keywords: 'services engineering design خدمات',
  },
  {
    id: 'page-projects',
    type: 'page',
    title: 'Projects',
    titleAr: 'المشاريع',
    excerpt: 'Built projects, interiors and planning studies across the UAE.',
    excerptAr: 'مشاريع منفّذة وتصميم داخلي ودراسات تخطيط عبر الإمارات.',
    path: 'projects',
    keywords: 'projects portfolio works مشاريع',
  },
  {
    id: 'page-sectors',
    type: 'page',
    title: 'Sectors',
    titleAr: 'القطاعات',
    excerpt: 'Towers, buildings, industrial, education, villas and interiors.',
    excerptAr: 'أبراج ومبانٍ وصناعي وتعليم وفلل وتصميم داخلي.',
    path: 'sectors',
    keywords: 'sectors industries قطاعات',
  },
  {
    id: 'page-blog',
    type: 'page',
    title: 'Blog',
    titleAr: 'المدونة',
    excerpt: 'Engineering insights, design notes and delivery perspectives from ASAS.',
    excerptAr: 'رؤى هندسية وملاحظات تصميم ومنظور التنفيذ من أساس.',
    path: 'blog',
    keywords: 'blog articles insights news مدونة مقالات',
  },
  {
    id: 'page-careers',
    type: 'page',
    title: 'Careers',
    titleAr: 'الوظائف',
    excerpt: 'Open roles and careers at ASAS in Abu Dhabi.',
    excerptAr: 'الوظائف الشاغرة والعمل في أساس بأبوظبي.',
    path: 'careers',
    keywords: 'careers jobs hiring jobs وظائف',
  },
  {
    id: 'page-contact',
    type: 'page',
    title: 'Contact',
    titleAr: 'تواصل معنا',
    excerpt: 'Contact ASAS — Abu Dhabi office, phone and email.',
    excerptAr: 'تواصل مع أساس — مكتب أبوظبي والهاتف والبريد.',
    path: 'contact',
    keywords: 'contact phone email location تواصل',
  },
  {
    id: 'page-downloads',
    type: 'page',
    title: 'Downloads',
    titleAr: 'التنزيلات',
    excerpt: 'Company documents and downloadable resources.',
    excerptAr: 'وثائق الشركة والموارد القابلة للتنزيل.',
    path: 'downloads',
    keywords: 'downloads documents pdf تنزيلات',
  },
  {
    id: 'page-enquiry',
    type: 'page',
    title: 'Start a Project',
    titleAr: 'ابدأ مشروعاً',
    excerpt: 'Submit a project enquiry to the ASAS team.',
    excerptAr: 'أرسل استفسار مشروع لفريق أساس.',
    path: 'project-enquiry',
    keywords: 'enquiry start project quote استفسار',
  },
];

const TYPE_LABEL = {
  project: {en: 'Project', ar: 'مشروع'},
  service: {en: 'Service', ar: 'خدمة'},
  sector: {en: 'Sector', ar: 'قطاع'},
  career: {en: 'Career', ar: 'وظيفة'},
  blog: {en: 'Blog', ar: 'مدونة'},
  page: {en: 'Page', ar: 'صفحة'},
};

function entry({id, type, title, titleAr, excerpt, excerptAr, path, keywords = ''}) {
  return {
    id,
    type,
    title,
    titleAr,
    excerpt: excerpt || '',
    excerptAr: excerptAr || '',
    path,
    keywords,
    haystack: [title, titleAr, excerpt, excerptAr, keywords, path]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  };
}

let cachedIndex = null;

/** Flat searchable catalog of site content (client-safe). */
export function getSiteSearchIndex() {
  if (cachedIndex) return cachedIndex;

  const items = [
    ...PAGES.map((page) => entry(page)),
    ...projects.map((project) =>
      entry({
        id: `project-${project.slug}`,
        type: 'project',
        title: project.title,
        titleAr: project.titleAr,
        excerpt: project.location || project.description || '',
        excerptAr: project.locationAr || project.descriptionAr || '',
        path: `projects/${project.slug}`,
        keywords: [project.category, project.location, project.locationAr, ...(project.services || [])]
          .filter(Boolean)
          .join(' '),
      }),
    ),
    ...services.map((service) =>
      entry({
        id: `service-${service.slug}`,
        type: 'service',
        title: service.title,
        titleAr: service.titleAr,
        excerpt: service.description || '',
        excerptAr: service.descriptionAr || '',
        path: `services/${service.slug}`,
        keywords: [...(service.capabilities || []), ...(service.capabilitiesAr || [])].join(' '),
      }),
    ),
    ...sectors.map((sector) =>
      entry({
        id: `sector-${sector.slug}`,
        type: 'sector',
        title: sector.title,
        titleAr: sector.titleAr,
        excerpt: sector.description || '',
        excerptAr: sector.descriptionAr || '',
        path: `sectors/${sector.slug}`,
        keywords: sector.projectCategory || '',
      }),
    ),
    ...jobs
      .filter((job) => job.status === 'open')
      .map((job) =>
        entry({
          id: `career-${job.slug}`,
          type: 'career',
          title: job.title,
          titleAr: job.titleAr,
          excerpt: job.summary || job.location || '',
          excerptAr: job.summaryAr || job.locationAr || '',
          path: `careers/${job.slug}`,
          keywords: [job.department, job.location, job.locationAr, job.type].filter(Boolean).join(' '),
        }),
      ),
    ...getPosts().map((post) =>
      entry({
        id: `blog-${post.slug}`,
        type: 'blog',
        title: post.title,
        titleAr: post.titleAr,
        excerpt: post.excerpt || '',
        excerptAr: post.excerptAr || '',
        path: `blog/${post.slug}`,
        keywords: [post.category, ...(post.body || []).slice(0, 1)].filter(Boolean).join(' '),
      }),
    ),
  ];

  cachedIndex = items;
  return items;
}

export function typeLabel(type, locale) {
  const row = TYPE_LABEL[type] || TYPE_LABEL.page;
  return locale === 'ar' ? row.ar : row.en;
}

/**
 * Ranked search across the site index.
 * @returns {{item: object, score: number}[]}
 */
export function searchSite(query, {limit = 24} = {}) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  if (!q || q.length < 1) return [];

  const tokens = q.split(' ').filter(Boolean);
  const index = getSiteSearchIndex();
  const scored = [];

  for (const item of index) {
    let score = 0;
    const titleEn = (item.title || '').toLowerCase();
    const titleAr = (item.titleAr || '').toLowerCase();

    if (titleEn === q || titleAr === q) score += 100;
    if (titleEn.startsWith(q) || titleAr.startsWith(q)) score += 40;
    if (titleEn.includes(q) || titleAr.includes(q)) score += 28;
    if (item.haystack.includes(q)) score += 12;

    let tokenHits = 0;
    for (const token of tokens) {
      if (item.haystack.includes(token)) tokenHits += 1;
    }
    if (tokens.length && tokenHits === tokens.length) score += 18 + tokenHits * 4;
    else if (tokenHits) score += tokenHits * 3;

    if (score > 0) scored.push({item, score});
  }

  scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));
  return scored.slice(0, limit);
}

export function hrefForResult(item, locale) {
  if (!item?.path) return `/${locale}`;
  return `/${locale}/${item.path}`.replace(/\/$/, '') || `/${locale}`;
}
