/**
 * Central CMS content service — ensure-seed from existing data modules, then read/write CMS JSON.
 */
import {
  deleteCollectionItem,
  ensureCollection,
  ensureDocument,
  readCollection,
  readDocument,
  upsertCollectionItem,
  writeCollection,
  writeDocument,
} from './json-store';
import buildHomepageSeed from './seeds/homepage-seed';

function nowIso() {
  return new Date().toISOString();
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/* ─── Settings ───────────────────────────────────────────────────────────── */

async function seedSettings() {
  const companyMod = await import('@/data/company');
  const socialMod = await import('@/data/socialLinks');
  const {DEFAULT_BRANDING} = await import('./branding');
  return {
    company: clone(companyMod.company),
    socialLinks: clone(socialMod.socialLinks),
    socialNetworks: clone(socialMod.socialNetworks),
    stats: clone(companyMod.stats),
    vision: clone(companyMod.vision),
    mission: clone(companyMod.mission),
    strengths: clone(companyMod.strengths),
    workLocations: clone(companyMod.workLocations),
    standards: clone(companyMod.standards),
    branding: clone(DEFAULT_BRANDING),
    updatedAt: nowIso(),
  };
}

export async function getSettings() {
  return ensureDocument('settings', seedSettings);
}

export async function updateSettings(patch = {}) {
  const current = await getSettings();
  const next = {
    ...current,
    ...patch,
    company: {...(current.company || {}), ...(patch.company || {})},
    socialLinks: {...(current.socialLinks || {}), ...(patch.socialLinks || {})},
    vision: {...(current.vision || {}), ...(patch.vision || {})},
    mission: {...(current.mission || {}), ...(patch.mission || {})},
    branding: {
      ...(current.branding || {}),
      ...(patch.branding || {}),
    },
    updatedAt: nowIso(),
  };
  if (Array.isArray(patch.stats)) next.stats = patch.stats;
  if (Array.isArray(patch.strengths)) next.strengths = patch.strengths;
  if (Array.isArray(patch.workLocations)) next.workLocations = patch.workLocations;
  if (Array.isArray(patch.standards)) next.standards = patch.standards;
  if (Array.isArray(patch.socialNetworks)) next.socialNetworks = patch.socialNetworks;
  await writeDocument('settings', next);
  return next;
}

/* ─── Homepage ───────────────────────────────────────────────────────────── */

export async function getHomepage() {
  return ensureDocument('homepage', () => buildHomepageSeed());
}

export async function updateHomepage(doc = {}) {
  const current = await getHomepage();
  const next = {
    ...current,
    ...doc,
    updatedAt: nowIso(),
  };
  await writeDocument('homepage', next);
  return next;
}

/* ─── Navigation ─────────────────────────────────────────────────────────── */

function buildNavigationSeed() {
  return {
    items: [
      {
        id: 'home',
        label: 'Home',
        labelAr: 'الرئيسية',
        path: '',
        home: true,
        hidden: false,
        order: 10,
      },
      {
        id: 'about',
        label: 'About',
        labelAr: 'من نحن',
        path: 'about',
        hidden: false,
        order: 20,
        children: [
          {id: 'company-profile', label: 'Company Profile', labelAr: 'الملف التعريفي', path: 'company-profile'},
          {id: 'team', label: 'Team', labelAr: 'الفريق', path: 'team'},
        ],
      },
      {
        id: 'gallery',
        label: 'Gallery',
        labelAr: 'المعرض',
        path: 'gallery',
        hidden: false,
        order: 25,
        children: [
          {id: 'gallery-photos', label: 'Photos', labelAr: 'الصور', path: 'gallery'},
          {id: 'gallery-videos', label: 'Videos', labelAr: 'الفيديو', path: 'videos'},
        ],
      },
      {id: 'services', label: 'Services', labelAr: 'الخدمات', path: 'services', hidden: false, order: 30},
      {id: 'projects', label: 'Projects', labelAr: 'المشاريع', path: 'projects', hidden: false, order: 40},
      {id: 'portfolio', label: 'Portfolio', labelAr: 'الأعمال', path: 'portfolio', hidden: true, order: 50},
      {id: 'sectors', label: 'Sectors', labelAr: 'القطاعات', path: 'sectors', hidden: false, order: 60},
      {id: 'blog', label: 'Blog', labelAr: 'المدونة', path: 'blog', hidden: false, order: 70},
      {id: 'careers', label: 'Careers', labelAr: 'الوظائف', path: 'careers', hidden: false, order: 80},
      {id: 'contact', label: 'Contact', labelAr: 'تواصل', path: 'contact', hidden: false, order: 90},
    ],
    updatedAt: nowIso(),
  };
}

export async function getNavigation() {
  const doc = await ensureDocument('navigation', buildNavigationSeed);
  return migrateGalleryNav(doc);
}

/** Lift Gallery out of About and ensure Photos / Videos children. */
async function migrateGalleryNav(doc) {
  const items = Array.isArray(doc?.items) ? [...doc.items] : [];
  let changed = false;

  const about = items.find((item) => item.id === 'about' || item.path === 'about');
  if (about?.children?.some((child) => child.path === 'gallery' || child.id === 'gallery')) {
    about.children = about.children.filter(
      (child) => child.path !== 'gallery' && child.id !== 'gallery',
    );
    changed = true;
  }

  let gallery = items.find((item) => item.id === 'gallery' || item.path === 'gallery');
  const desiredChildren = [
    {id: 'gallery-photos', label: 'Photos', labelAr: 'الصور', path: 'gallery'},
    {id: 'gallery-videos', label: 'Videos', labelAr: 'الفيديو', path: 'videos'},
  ];

  if (!gallery || gallery.id === 'gallery-photos') {
    gallery = {
      id: 'gallery',
      label: 'Gallery',
      labelAr: 'المعرض',
      path: 'gallery',
      hidden: false,
      order: 25,
      children: desiredChildren,
    };
    const aboutIdx = items.findIndex((item) => item.id === 'about' || item.path === 'about');
    if (aboutIdx >= 0) items.splice(aboutIdx + 1, 0, gallery);
    else items.push(gallery);
    changed = true;
  } else {
    const hasVideos = gallery.children?.some((child) => child.path === 'videos');
    const hasPhotos = gallery.children?.some((child) => child.path === 'gallery');
    if (!hasVideos || !hasPhotos || !Array.isArray(gallery.children) || gallery.children.length < 2) {
      gallery.children = desiredChildren;
      gallery.hidden = false;
      if (gallery.order == null) gallery.order = 25;
      changed = true;
    }
  }

  if (!changed) return doc;
  const next = {...doc, items, updatedAt: nowIso()};
  await writeDocument('navigation', next);
  return next;
}

export async function updateNavigation(doc = {}) {
  const current = await getNavigation();
  const next = {
    ...current,
    ...doc,
    items: Array.isArray(doc.items) ? doc.items : current.items,
    updatedAt: nowIso(),
  };
  await writeDocument('navigation', next);
  return next;
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */

function buildFooterSeed() {
  return {
    companyLinks: [
      {id: 'about', labelEn: 'About', labelAr: 'من نحن', path: 'about', order: 10, hidden: false},
      {id: 'projects', labelEn: 'Projects', labelAr: 'المشاريع', path: 'projects', order: 20, hidden: false},
      {id: 'gallery', labelEn: 'Gallery', labelAr: 'المعرض', path: 'gallery', order: 30, hidden: false},
      {id: 'videos', labelEn: 'Videos', labelAr: 'الفيديو', path: 'videos', order: 35, hidden: false},
      {id: 'portfolio', labelEn: 'Portfolio', labelAr: 'الأعمال', path: 'portfolio', order: 40, hidden: false},
      {id: 'team', labelEn: 'Team', labelAr: 'الفريق', path: 'team', order: 50, hidden: false},
      {id: 'sectors', labelEn: 'Sectors', labelAr: 'القطاعات', path: 'sectors', order: 60, hidden: false},
      {id: 'blog', labelEn: 'Blog', labelAr: 'المدونة', path: 'blog', order: 70, hidden: false},
      {id: 'careers', labelEn: 'Careers', labelAr: 'الوظائف', path: 'careers', order: 80, hidden: false},
      {id: 'downloads', labelEn: 'Downloads', labelAr: 'التنزيلات', path: 'downloads', order: 90, hidden: false},
      {id: 'contact', labelEn: 'Contact', labelAr: 'تواصل', path: 'contact', order: 100, hidden: false},
      {
        id: 'project-enquiry',
        labelEn: 'Project Enquiry',
        labelAr: 'استفسار مشروع',
        path: 'project-enquiry',
        order: 110,
        hidden: false,
      },
    ],
    cta: {
      eyebrowEn: '',
      eyebrowAr: '',
      titleEn: '',
      titleAr: '',
      bodyEn: '',
      bodyAr: '',
      buttonEn: '',
      buttonAr: '',
      href: 'project-enquiry',
    },
    updatedAt: nowIso(),
  };
}

export async function getFooter() {
  return ensureDocument('footer', buildFooterSeed);
}

export async function updateFooter(doc = {}) {
  const current = await getFooter();
  const next = {
    ...current,
    ...doc,
    companyLinks: Array.isArray(doc.companyLinks) ? doc.companyLinks : current.companyLinks,
    cta: {...(current.cta || {}), ...(doc.cta || {})},
    updatedAt: nowIso(),
  };
  await writeDocument('footer', next);
  return next;
}

/* ─── Blog ───────────────────────────────────────────────────────────────── */

async function seedBlogPosts() {
  const mod = await import('@/data/blog');
  return clone(mod.posts || []).map((post, index) => ({
    id: post.slug || `post-${index + 1}`,
    status: 'published',
    ...post,
  }));
}

export async function getBlogPosts() {
  return ensureCollection('blog-posts', seedBlogPosts);
}

export async function getBlogPostBySlug(slug) {
  const posts = await getBlogPosts();
  return posts.find((post) => post.slug === slug) || null;
}

export async function saveBlogPost(post) {
  if (!post?.slug) {
    const error = new Error('Blog post slug is required');
    error.status = 400;
    throw error;
  }
  const payload = {
    ...post,
    id: post.id || post.slug,
    status: post.status || 'published',
    updatedAt: nowIso(),
  };
  return upsertCollectionItem('blog-posts', payload, 'slug');
}

export async function deleteBlogPost(slug) {
  return deleteCollectionItem('blog-posts', slug, 'slug');
}

/* ─── Projects ───────────────────────────────────────────────────────────── */

async function seedProjects() {
  const mod = await import('@/data/projects');
  return clone(mod.projects || []).map((project) => ({
    status: 'published',
    ...project,
  }));
}

export async function getProjects() {
  return ensureCollection('projects', seedProjects);
}

export async function getProjectBySlug(slug) {
  const items = await getProjects();
  return items.find((item) => item.slug === slug) || null;
}

export async function saveProject(project) {
  if (!project?.slug) {
    const error = new Error('Project slug is required');
    error.status = 400;
    throw error;
  }
  const payload = {
    ...project,
    id: project.id || project.slug,
    status: project.status || 'published',
    updatedAt: nowIso(),
  };
  return upsertCollectionItem('projects', payload, 'slug');
}

export async function deleteProject(slug) {
  return deleteCollectionItem('projects', slug, 'slug');
}

/* ─── Services ───────────────────────────────────────────────────────────── */

async function seedServices() {
  const mod = await import('@/data/services');
  return clone(mod.services || []).map((service) => ({
    id: service.slug,
    status: 'published',
    ...service,
  }));
}

export async function getServices() {
  return ensureCollection('services', seedServices);
}

export async function getServiceBySlug(slug) {
  const items = await getServices();
  return items.find((item) => item.slug === slug) || null;
}

export async function saveService(service) {
  if (!service?.slug) {
    const error = new Error('Service slug is required');
    error.status = 400;
    throw error;
  }
  const payload = {
    ...service,
    id: service.id || service.slug,
    status: service.status || 'published',
    updatedAt: nowIso(),
  };
  return upsertCollectionItem('services', payload, 'slug');
}

/* ─── Sectors ────────────────────────────────────────────────────────────── */

async function seedSectors() {
  const mod = await import('@/data/sectors');
  return clone(mod.sectors || []).map((sector) => ({
    id: sector.slug,
    status: 'published',
    ...sector,
  }));
}

export async function getSectors() {
  return ensureCollection('sectors', seedSectors);
}

export async function getSectorBySlug(slug) {
  const items = await getSectors();
  return items.find((item) => item.slug === slug) || null;
}

export async function saveSector(sector) {
  if (!sector?.slug) {
    const error = new Error('Sector slug is required');
    error.status = 400;
    throw error;
  }
  const payload = {
    ...sector,
    id: sector.id || sector.slug,
    status: sector.status || 'published',
    updatedAt: nowIso(),
  };
  return upsertCollectionItem('sectors', payload, 'slug');
}

/* ─── Clients ────────────────────────────────────────────────────────────── */

async function seedClients() {
  const mod = await import('@/data/clients');
  return clone(mod.clients || []);
}

export async function getClients() {
  return ensureCollection('clients', seedClients);
}

export async function saveClient(client) {
  if (!client?.id) {
    const error = new Error('Client id is required');
    error.status = 400;
    throw error;
  }
  return upsertCollectionItem('clients', {...client, updatedAt: nowIso()}, 'id');
}

/* ─── Testimonials ───────────────────────────────────────────────────────── */

async function seedTestimonials() {
  const mod = await import('@/data/testimonials');
  return clone(mod.testimonials || []);
}

export async function getTestimonials() {
  return ensureCollection('testimonials', seedTestimonials);
}

export async function saveTestimonial(item) {
  if (!item?.id) {
    const error = new Error('Testimonial id is required');
    error.status = 400;
    throw error;
  }
  return upsertCollectionItem('testimonials', {...item, updatedAt: nowIso()}, 'id');
}

/* ─── Gallery ────────────────────────────────────────────────────────────── */

async function seedGallery() {
  const mod = await import('@/data/gallery');
  return clone(mod.galleryItems || []);
}

export async function getGalleryItems() {
  return ensureCollection('gallery', seedGallery);
}

/* ─── Videos ─────────────────────────────────────────────────────────────── */

async function seedVideos() {
  const mod = await import('@/data/videos');
  return clone(mod.videoItems || []);
}

export async function getVideos() {
  return ensureCollection('videos', seedVideos);
}

export async function saveVideo(item) {
  if (!item?.id && !item?.youtubeId && !item?.slug) {
    const error = new Error('Video id or YouTube id is required');
    error.status = 400;
    throw error;
  }
  const youtubeId = String(item.youtubeId || '').trim();
  const id = item.id || (youtubeId ? `v-${youtubeId}` : item.slug);
  const payload = {
    ...item,
    id,
    youtubeId,
    slug: item.slug || id,
    thumbnail:
      item.thumbnail ||
      (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : ''),
    embedUrl:
      item.embedUrl ||
      (youtubeId ? `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1` : ''),
    watchUrl:
      item.watchUrl || (youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ''),
    status: item.status || 'published',
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : 999,
    updatedAt: nowIso(),
  };
  return upsertCollectionItem('videos', payload, 'id');
}

export async function deleteVideo(id) {
  await getVideos();
  return deleteCollectionItem('videos', id, 'id');
}

/* ─── Jobs / Careers ─────────────────────────────────────────────────────── */

async function seedJobs() {
  const mod = await import('@/data/careers');
  return clone(mod.jobs || []).map((job) => ({
    id: job.slug,
    ...job,
  }));
}

export async function getJobs() {
  return ensureCollection('jobs', seedJobs);
}

export async function getJobBySlug(slug) {
  const items = await getJobs();
  return items.find((item) => item.slug === slug) || null;
}

export async function saveJob(job) {
  if (!job?.slug) {
    const error = new Error('Job slug is required');
    error.status = 400;
    throw error;
  }
  const payload = {
    ...job,
    id: job.id || job.slug,
    updatedAt: nowIso(),
  };
  return upsertCollectionItem('jobs', payload, 'slug');
}

/* ─── Downloads ──────────────────────────────────────────────────────────── */

function seedDownloads() {
  return [
    {
      id: 'company-profile',
      titleEn: 'ASAS Company Profile',
      titleAr: 'الملف التعريفي لأساس',
      href: '/downloads/asas-company-profile.pdf',
      size: '7.7 MB',
      featured: true,
      order: 10,
    },
  ];
}

export async function getDownloads() {
  return ensureCollection('downloads', seedDownloads);
}

export async function saveDownload(item) {
  if (!item?.id) {
    const error = new Error('Download id is required');
    error.status = 400;
    throw error;
  }
  return upsertCollectionItem('downloads', {...item, updatedAt: nowIso()}, 'id');
}

/* ─── Media ──────────────────────────────────────────────────────────────── */

export async function listMedia() {
  return ensureCollection('media', () => []);
}

export async function addMedia(item) {
  const payload = {
    id: item?.id || `media-${Date.now().toString(36)}`,
    createdAt: nowIso(),
    ...item,
  };
  return upsertCollectionItem('media', payload, 'id');
}

export async function updateMedia(id, patch = {}) {
  if (!id) {
    const error = new Error('Media id is required');
    error.status = 400;
    throw error;
  }
  const items = await listMedia();
  const existing = items.find((entry) => entry?.id === id);
  if (!existing) {
    const error = new Error('Media not found');
    error.status = 404;
    throw error;
  }
  return upsertCollectionItem(
    'media',
    {
      ...existing,
      ...patch,
      id,
      updatedAt: nowIso(),
    },
    'id',
  );
}

export async function deleteMedia(id) {
  if (!id) {
    const error = new Error('Media id is required');
    error.status = 400;
    throw error;
  }
  return deleteCollectionItem('media', id, 'id');
}

/* ─── Enquiries ──────────────────────────────────────────────────────────── */

export async function listEnquiries() {
  return ensureCollection('enquiries', () => []);
}

export async function addEnquiry(item) {
  const payload = {
    id: item?.id || `enq-${Date.now().toString(36)}`,
    createdAt: nowIso(),
    status: item?.status || 'new',
    assignedTo: item?.assignedTo || null,
    notes: Array.isArray(item?.notes) ? item.notes : [],
    activity: Array.isArray(item?.activity) ? item.activity : [],
    ...item,
  };
  return upsertCollectionItem('enquiries', payload, 'id');
}

export async function updateEnquiry(id, patch = {}) {
  const items = await listEnquiries();
  const current = items.find((item) => item.id === id);
  if (!current) {
    const error = new Error('Enquiry not found');
    error.status = 404;
    throw error;
  }
  const next = {
    ...current,
    ...patch,
    id,
    updatedAt: nowIso(),
  };
  if (patch.noteAdd) {
    const note = {
      id: `note-${Date.now().toString(36)}`,
      text: String(patch.noteAdd.text || ''),
      author: patch.noteAdd.author || 'Admin',
      at: nowIso(),
    };
    next.notes = [note, ...(current.notes || [])];
    next.activity = [
      {id: `act-${Date.now().toString(36)}`, type: 'note', text: 'Note added', at: nowIso()},
      ...(current.activity || []),
    ];
    delete next.noteAdd;
  }
  if (patch.status && patch.status !== current.status) {
    next.activity = [
      {
        id: `act-${Date.now().toString(36)}`,
        type: 'status',
        text: `Status → ${patch.status}`,
        at: nowIso(),
      },
      ...(next.activity || current.activity || []),
    ];
  }
  return upsertCollectionItem('enquiries', next, 'id');
}

export async function listContacts() {
  const enquiries = await listEnquiries();
  const map = new Map();
  for (const enq of enquiries) {
    const key = String(enq.email || enq.phone || enq.id).toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name: enq.name || enq.fullName || 'Contact',
        email: enq.email || '',
        phone: enq.phone || '',
        company: enq.company || '',
        enquiries: [],
      });
    }
    map.get(key).enquiries.push(enq);
  }
  return [...map.values()];
}

export async function listApplications() {
  return ensureCollection('applications', async () => {
    // Prefer career applications from .data if present later
    return [];
  });
}

export async function updateApplication(id, patch = {}) {
  const items = await listApplications();
  const current = items.find((item) => item.id === id);
  if (!current) {
    const error = new Error('Application not found');
    error.status = 404;
    throw error;
  }
  return upsertCollectionItem(
    'applications',
    {...current, ...patch, id, updatedAt: nowIso()},
    'id',
  );
}

/* ─── Redirects ──────────────────────────────────────────────────────────── */

export async function getRedirects() {
  return ensureDocument('redirects', () => ({items: [], updatedAt: nowIso()}));
}

export async function saveRedirects(doc = {}) {
  const current = await getRedirects();
  const next = {
    ...current,
    ...doc,
    items: Array.isArray(doc.items) ? doc.items : current.items || [],
    updatedAt: nowIso(),
  };
  await writeDocument('redirects', next);
  return next;
}

/* ─── Page copy (about, contact, careers, downloads, terms, privacy) ─────── */

const PAGE_COPY_IDS = ['about', 'contact', 'careers', 'downloads', 'videos', 'terms', 'privacy'];

function defaultPageCopy(pageId) {
  const defaults = {
    about: {
      titleEn: 'About ASAS',
      titleAr: 'عن أساس',
      eyebrowEn: 'Company',
      eyebrowAr: 'الشركة',
      ledeEn: 'Abu Dhabi engineering consultancy since 2009.',
      ledeAr: 'استشارات هندسية من أبوظبي منذ 2009.',
      heroImage: '/assets/asas/generated/ready/ABOUT-HERO-001.webp',
      heroImageFocal: '50% 40%',
      heroTitleEn: 'Engineering expertise founded in Abu Dhabi in 2009',
      heroTitleAr: 'خبرة هندسية تأسست في أبوظبي عام 2009',
      heroLedeEn:
        'ASAS Engineering & Project Management Consultancy delivers multi-discipline engineering from Abu Dhabi.',
      heroLedeAr:
        'تقدم أساس للاستشارات الهندسية وإدارة المشاريع خدمات هندسية متعددة التخصصات من أبوظبي.',
      heroCtaLabelEn: 'Company profile',
      heroCtaLabelAr: 'الملف التعريفي',
      heroCtaHref: '/downloads',
      ctaImage: '/assets/asas/roles/asas-role-about-featured.webp',
      ctaImageFocal: '50% 40%',
      ctaKickerEn: 'Next',
      ctaKickerAr: 'التالي',
      ctaTitleEn: 'Explore services or projects',
      ctaTitleAr: 'استكشف الخدمات أو المشاريع',
      ctaLedeEn: 'Review service scopes or selected work from the official portfolio.',
      ctaLedeAr: 'اطّلع على نطاقات الخدمات أو الأعمال المختارة من الملف الرسمي.',
      ctaPrimaryLabelEn: 'Services',
      ctaPrimaryLabelAr: 'الخدمات',
      ctaPrimaryHref: '/services',
      ctaSecondaryLabelEn: 'Projects',
      ctaSecondaryLabelAr: 'المشاريع',
      ctaSecondaryHref: '/projects',
    },
    contact: {
      titleEn: 'Contact',
      titleAr: 'تواصل',
      eyebrowEn: 'Get in touch',
      eyebrowAr: 'تواصل معنا',
      ledeEn: 'Reach the Abu Dhabi office or start a project enquiry.',
      ledeAr: 'تواصل مع مكتب أبوظبي أو ابدأ استفسار مشروع.',
      heroImage: '/assets/asas/generated/ready/CONTACT-HERO-001.webp',
      heroImageFocal: '50% 40%',
      heroTitleEn: 'Reach ASAS offices in Abu Dhabi, Dubai & Syria',
      heroTitleAr: 'تواصل مع مكاتب أساس في أبوظبي ودبي وسوريا',
      heroLedeEn: 'Office details, location maps and a project enquiry form — all on one page.',
      heroLedeAr: 'بيانات المكاتب والخرائط ونموذج استفسار المشروع في صفحة واحدةحدة.',
      heroCtaLabelEn: '',
      heroCtaLabelAr: '',
      heroCtaHref: '',
      ctaImage: '/assets/asas/generated/ready/CONTACT-HERO-001.webp',
      ctaImageFocal: '50% 40%',
      ctaKickerEn: 'Explore',
      ctaKickerAr: 'استكشف',
      ctaTitleEn: 'Review services or projects first',
      ctaTitleAr: 'راجع الخدمات أو المشاريع أولاً',
      ctaLedeEn: 'If you are still exploring scope, start from the services or projects pages.',
      ctaLedeAr: 'إذا كنت لا تزال تستكشف النطاق، ابدأ من صفحات الخدمات أو المشاريع.',
      ctaPrimaryLabelEn: 'Services',
      ctaPrimaryLabelAr: 'الخدمات',
      ctaPrimaryHref: '/services',
      ctaSecondaryLabelEn: 'Projects',
      ctaSecondaryLabelAr: 'المشاريع',
      ctaSecondaryHref: '/projects',
    },
    careers: {
      titleEn: 'Careers',
      titleAr: 'الوظائف',
      eyebrowEn: 'Join ASAS',
      eyebrowAr: 'انضم إلى أساس',
      ledeEn: 'Open roles across architecture, structure, MEP and project delivery.',
      ledeAr: 'فرص مفتوحة عبر العمارة والإنشاءات وMEP وتنفيذ المشاريع.',
      heroImage: '/assets/asas/generated/ready/CAREERS-HERO-001.webp',
      heroImageFocal: '50% 35%',
      heroTitleEn: 'Engineering disciplines working as one team',
      heroTitleAr: 'تخصصات هندسية تعمل ضمن فريق واحد',
      heroLedeEn:
        'Staffing is set according to each project, with external associates supplementing ASAS teams for large-scale work when required.',
      heroLedeAr:
        'تحدد احتياجات التوظيف وفق كل مشروع، مع دعم فرق أساس للاستشارات الهندسية وإدارة المشاريع بخبرات خارجية عند الحاجة للأعمال واسعة النطاق.',
      heroCtaLabelEn: 'Browse openings',
      heroCtaLabelAr: 'عرض الشواغر',
      heroCtaHref: '#openings',
      ctaImage: '/assets/asas/generated/ready/CAREERS-HERO-001.webp',
      ctaImageFocal: '50% 30%',
      ctaKickerEn: 'Contact',
      ctaKickerAr: 'تواصل',
      ctaTitleEn: 'Questions about hiring?',
      ctaTitleAr: 'أسئلة حول التوظيف؟',
      ctaLedeEn: 'For career questions, reach the Abu Dhabi office through the official email.',
      ctaLedeAr: 'للاستفسارات المهنية يمكن التواصل مع مكتب أبوظبي عبر البريد الرسمي.',
      ctaPrimaryLabelEn: 'asas@asasengg.ae',
      ctaPrimaryLabelAr: 'asas@asasengg.ae',
      ctaPrimaryHref: 'mailto:asas@asasengg.ae?subject=Career%20enquiry',
      ctaSecondaryLabelEn: 'Contact page',
      ctaSecondaryLabelAr: 'صفحة التواصل',
      ctaSecondaryHref: '/contact',
    },
    downloads: {
      titleEn: 'Downloads',
      titleAr: 'التحميلات',
      eyebrowEn: 'Documents',
      eyebrowAr: 'مستندات',
      ledeEn: 'Download the official ASAS Company Profile.',
      ledeAr: 'حمّل الملف التعريفي الرسمي لأساس.',
      heroImage: '/assets/asas/generated/ready/DOWNLOADS-HERO-001.webp',
      heroImageFocal: '50% 40%',
      heroTitleEn: 'Official ASAS resources',
      heroTitleAr: 'موارد أساس للاستشارات الهندسية وإدارة المشاريع الرسمية',
      heroLedeEn:
        'Explore the firm, capabilities, methodology and selected projects through the official company profile.',
      heroLedeAr:
        'تعرّف على الشركة وقدراتها ومنهجيتها ومشاريعها المختارة عبر الملف التعريفي الرسمي.',
      heroCtaLabelEn: '',
      heroCtaLabelAr: '',
      heroCtaHref: '',
      ctaImage: '/assets/asas/generated/ready/DOWNLOADS-HERO-001.webp',
      ctaImageFocal: '50% 40%',
      ctaKickerEn: 'Next Step',
      ctaKickerAr: 'الخطوة التالية',
      ctaTitleEn: 'Ready to discuss a project?',
      ctaTitleAr: 'هل ترغب بمناقشة مشروع؟',
      ctaLedeEn:
        'Review selected work from the portfolio, or contact the office to start a project enquiry.',
      ctaLedeAr: 'راجع المشاريع المختارة أو تواصل مع المكتب لبدء استفسار مشروع.',
      ctaPrimaryLabelEn: 'Submit a Project Enquiry',
      ctaPrimaryLabelAr: 'أرسل استفسار مشروع',
      ctaPrimaryHref: '/project-enquiry',
      ctaSecondaryLabelEn: 'View projects',
      ctaSecondaryLabelAr: 'عرض المشاريع',
      ctaSecondaryHref: '/projects',
    },
    videos: {
      titleEn: 'Videos',
      titleAr: 'الفيديو',
      eyebrowEn: 'Gallery',
      eyebrowAr: 'المعرض',
      ledeEn: 'ASAS Engineering video archive from the official gallery.',
      ledeAr: 'أرشيف فيديو أساس من المعرض الرسمي.',
      heroImage: '/assets/asas/roles/asas-role-company-profile-hero.webp',
      heroImageFocal: '50% 35%',
      heroTitleEn: 'ASAS Video Archive',
      heroTitleAr: 'أرشيف فيديو أساس',
      heroLedeEn:
        'Moments from ASAS projects and practice — curated from the official archive and managed in the CMS.',
      heroLedeAr:
        'مشاهد من مشاريع ومكاتب أساس — مختارة من الأرشيف الرسمي ومُدارة من لوحة التحكم.',
      heroCtaLabelEn: 'Photo Gallery',
      heroCtaLabelAr: 'معرض الصور',
      heroCtaHref: '/gallery',
      ctaImage: '/assets/asas/roles/asas-role-projects-hero.webp',
      ctaImageFocal: '50% 40%',
      ctaKickerEn: 'Explore more',
      ctaKickerAr: 'استكشف أكثر',
      ctaTitleEn: 'Photos & projects',
      ctaTitleAr: 'الصور والمشاريع',
      ctaLedeEn:
        'Continue to the photo gallery or browse selected projects from the company profile.',
      ctaLedeAr: 'انتقل إلى معرض الصور أو تصفح المشاريع المختارة من ملف الشركة.',
      ctaPrimaryLabelEn: 'Photos',
      ctaPrimaryLabelAr: 'الصور',
      ctaPrimaryHref: '/gallery',
      ctaSecondaryLabelEn: 'Projects',
      ctaSecondaryLabelAr: 'المشاريع',
      ctaSecondaryHref: '/projects',
    },
    terms: {
      titleEn: 'Terms of Use',
      titleAr: 'شروط الاستخدام',
      eyebrowEn: 'Legal',
      eyebrowAr: 'قانوني',
      ledeEn: 'Terms governing use of the ASAS website.',
      ledeAr: 'الشروط التي تحكم استخدام موقع أساس.',
    },
    privacy: {
      titleEn: 'Privacy Policy',
      titleAr: 'سياسة الخصوصية',
      eyebrowEn: 'Legal',
      eyebrowAr: 'قانوني',
      ledeEn: 'How ASAS handles personal information collected via this site.',
      ledeAr: 'كيف تتعامل أساس مع المعلومات الشخصية عبر هذا الموقع.',
    },
  };
  return {
    pageId,
    ...(defaults[pageId] || {
      titleEn: pageId,
      titleAr: pageId,
      eyebrowEn: '',
      eyebrowAr: '',
      ledeEn: '',
      ledeAr: '',
    }),
  };
}

async function seedPageCopy() {
  const pages = {};
  for (const pageId of PAGE_COPY_IDS) {
    pages[pageId] = defaultPageCopy(pageId);
  }
  return {pages, updatedAt: nowIso()};
}

function mergePageCopy(pageId, stored) {
  return {...defaultPageCopy(pageId), ...(stored || {}), pageId};
}

export async function getPageCopy(pageId) {
  const doc = await ensureDocument('page-copy', seedPageCopy);
  if (pageId) {
    return mergePageCopy(pageId, doc.pages?.[pageId]);
  }
  const pages = {};
  for (const id of PAGE_COPY_IDS) {
    pages[id] = mergePageCopy(id, doc.pages?.[id]);
  }
  return {...doc, pages};
}

export async function savePageCopy(pageId, patch = {}) {
  if (!pageId) {
    const error = new Error('pageId is required');
    error.status = 400;
    throw error;
  }
  const doc = await ensureDocument('page-copy', seedPageCopy);
  const current = mergePageCopy(pageId, doc.pages?.[pageId]);
  const cleaned = {...patch};
  for (const key of Object.keys(cleaned)) {
    if (key.startsWith('_') || key === 'updatedAt') delete cleaned[key];
  }
  const nextPage = {...current, ...cleaned, pageId, updatedAt: nowIso()};
  const next = {
    ...doc,
    pages: {...(doc.pages || {}), [pageId]: nextPage},
    updatedAt: nowIso(),
  };
  await writeDocument('page-copy', next);
  return nextPage;
}

/* ─── Helpers used by admin dashboards ───────────────────────────────────── */

export async function readRawCollection(name) {
  return readCollection(name);
}

export async function writeRawCollection(name, items) {
  return writeCollection(name, items);
}

export async function readRawDocument(name, defaultValue = null) {
  return readDocument(name, defaultValue);
}
