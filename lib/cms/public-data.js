/**
 * Public-site async loaders — CMS content-service with static data fallback.
 * Use from SERVER pages / generateMetadata only. Client components keep sync @/data/* imports.
 */

function notDraft(items = []) {
  return items.filter((item) => item?.status !== 'draft');
}

/* ─── Settings / company ─────────────────────────────────────────────────── */

export async function getPublicSettings() {
  try {
    const {getSettings} = await import('./content-service');
    return await getSettings();
  } catch {
    const companyMod = await import('@/data/company');
    const socialMod = await import('@/data/socialLinks');
    return {
      company: companyMod.company,
      socialLinks: socialMod.socialLinks,
      socialNetworks: socialMod.socialNetworks,
      stats: companyMod.stats,
      vision: companyMod.vision,
      mission: companyMod.mission,
      strengths: companyMod.strengths,
      workLocations: companyMod.workLocations,
      standards: companyMod.standards,
    };
  }
}

export async function getPublicCompany() {
  const settings = await getPublicSettings();
  return settings?.company || (await import('@/data/company')).company;
}

export async function getPublicHomepage() {
  try {
    const {getHomepage} = await import('./content-service');
    return await getHomepage();
  } catch {
    const buildHomepageSeed = (await import('./seeds/homepage-seed')).default;
    return buildHomepageSeed();
  }
}

export async function getPublicNavigation() {
  try {
    const {getNavigation} = await import('./content-service');
    const doc = await getNavigation();
    const items = Array.isArray(doc?.items) ? doc.items : [];
    return items
      .filter((item) => !item.hidden)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch {
    return null;
  }
}

export async function getPublicFooter() {
  try {
    const {getFooter} = await import('./content-service');
    return await getFooter();
  } catch {
    return null;
  }
}

export async function getPublicPageCopy(pageId) {
  try {
    const {getPageCopy} = await import('./content-service');
    return await getPageCopy(pageId);
  } catch {
    return null;
  }
}

/* ─── Blog ───────────────────────────────────────────────────────────────── */

export async function getPublicBlogPosts() {
  try {
    const {getBlogPosts} = await import('./content-service');
    const items = await getBlogPosts();
    if (items?.length) {
      return notDraft(items).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    }
  } catch {
    /* fall through */
  }
  const {getPosts} = await import('@/data/blog');
  return getPosts();
}

export async function getPublicBlogPostBySlug(slug) {
  const posts = await getPublicBlogPosts();
  return posts.find((post) => post.slug === slug) || null;
}

export async function getPublicRelatedBlogPosts(slug, {limit = 3} = {}) {
  const posts = await getPublicBlogPosts();
  const current = posts.find((post) => post.slug === slug);
  if (!current) return posts.slice(0, limit);
  return posts
    .filter((post) => post.slug !== slug)
    .sort((a, b) => {
      const aScore = a.category === current.category ? 1 : 0;
      const bScore = b.category === current.category ? 1 : 0;
      return bScore - aScore;
    })
    .slice(0, limit);
}

/* ─── Projects ───────────────────────────────────────────────────────────── */

export async function getPublicProjects() {
  try {
    const {getProjects} = await import('./content-service');
    const items = await getProjects();
    if (items?.length) return notDraft(items);
  } catch {
    /* fall through */
  }
  const {projects} = await import('@/data/projects');
  return projects;
}

export async function getPublicProjectBySlug(slug) {
  const items = await getPublicProjects();
  return items.find((item) => item.slug === slug) || null;
}

/* ─── Services ───────────────────────────────────────────────────────────── */

export async function getPublicServices() {
  try {
    const {getServices} = await import('./content-service');
    const items = await getServices();
    if (items?.length) return notDraft(items);
  } catch {
    /* fall through */
  }
  const {services} = await import('@/data/services');
  return services;
}

export async function getPublicServiceBySlug(slug) {
  const items = await getPublicServices();
  return items.find((item) => item.slug === slug) || null;
}

export async function getPublicFeaturedServices() {
  const items = await getPublicServices();
  return items.filter((service) => service.featured);
}

/* ─── Sectors ────────────────────────────────────────────────────────────── */

export async function getPublicSectors() {
  try {
    const {getSectors} = await import('./content-service');
    const items = await getSectors();
    if (items?.length) return notDraft(items);
  } catch {
    /* fall through */
  }
  const {sectors} = await import('@/data/sectors');
  return sectors;
}

export async function getPublicSectorBySlug(slug) {
  const items = await getPublicSectors();
  return items.find((item) => item.slug === slug) || null;
}

/* ─── Clients / Testimonials / Gallery ───────────────────────────────────── */

export async function getPublicClients() {
  try {
    const {getClients} = await import('./content-service');
    const items = await getClients();
    if (items?.length) return items;
  } catch {
    /* fall through */
  }
  const {clients} = await import('@/data/clients');
  return clients;
}

export async function getPublicTestimonials() {
  try {
    const {getTestimonials} = await import('./content-service');
    const items = await getTestimonials();
    if (items?.length) return items;
  } catch {
    /* fall through */
  }
  const {testimonials} = await import('@/data/testimonials');
  return testimonials;
}

export async function getPublicGallery() {
  try {
    const {getGalleryItems} = await import('./content-service');
    const items = await getGalleryItems();
    if (items?.length) return items;
  } catch {
    /* fall through */
  }
  const {galleryItems} = await import('@/data/gallery');
  return galleryItems;
}

/* ─── Jobs / Careers ─────────────────────────────────────────────────────── */

export async function getPublicJobs() {
  try {
    const {getJobs} = await import('./content-service');
    const items = await getJobs();
    if (items?.length) return notDraft(items);
  } catch {
    /* fall through */
  }
  const {jobs} = await import('@/data/careers');
  return jobs;
}

export async function getPublicOpenJobs() {
  const items = await getPublicJobs();
  return items.filter((job) => job.status === 'open');
}

export async function getPublicJobBySlug(slug) {
  const items = await getPublicJobs();
  return items.find((item) => item.slug === slug) || null;
}

/* ─── Homepage section helpers ───────────────────────────────────────────── */

export function orderedHomepageSections(homepage) {
  const defaults = [
    {id: 'hero', enabled: true, order: 10},
    {id: 'about', enabled: true, order: 20},
    {id: 'clients', enabled: true, order: 30},
    {id: 'services', enabled: true, order: 40},
    {id: 'stats', enabled: true, order: 50},
    {id: 'sectors', enabled: true, order: 60},
    {id: 'process', enabled: true, order: 70},
    {id: 'portfolio', enabled: true, order: 80},
    {id: 'why', enabled: true, order: 90},
    {id: 'testimonials', enabled: true, order: 100},
    {id: 'team', enabled: true, order: 110},
    {id: 'contact', enabled: true, order: 120},
    {id: 'faq', enabled: true, order: 130},
  ];
  const sections = Array.isArray(homepage?.sections) && homepage.sections.length
    ? homepage.sections
    : defaults;
  return [...sections]
    .filter((section) => section && section.enabled !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}
