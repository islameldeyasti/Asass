import {galleryItems} from '@/data/gallery';
import {projects} from '@/data/projects';
import {roleImages} from '@/data/image-manifest';

export function pad(n) {
  return String(n).padStart(2, '0');
}

const FEATURED_SLUGS = [
  'residential-building-al-raha-rbw2',
  'four-towers-al-nahda',
  'emirates-private-school',
  'reception-hall-private-villa',
  'private-villa-shakhbout-w01',
  'showroom-musaffah-m42',
];

const FOCUS_SLUGS = [
  'american-international-school',
  'industrial-facility-musaffah-m15',
  'majlis-and-dining',
  'private-villa-mbz-z14',
  'hotel-lobby-interior',
  'residential-villa-al-shamkha-sh3',
];

function enrich(item, locale, projectBySlug) {
  const ar = locale === 'ar';
  const project = item.slug ? projectBySlug.get(item.slug) : null;
  return {
    ...item,
    label: project ? (ar ? project.titleAr : project.title) : ar ? item.titleAr : item.title,
    href: project ? `/${locale}/projects/${project.slug}` : null,
    location:
      (ar ? project?.locationShortAr || project?.locationAr : project?.locationShort || project?.location) ||
      null,
    caption: project ? (ar ? project.titleAr : project.title) : ar ? item.titleAr : item.title,
  };
}

export function buildJournalCatalog(locale) {
  const projectBySlug = new Map(projects.map((p) => [p.slug, p]));
  return galleryItems.map((item) => enrich(item, locale, projectBySlug));
}

function uniqueBySlug(items, slugs, used) {
  const out = [];
  for (const slug of slugs) {
    const hit = items.find((i) => i.slug === slug && !used.has(i.id));
    if (hit) {
      used.add(hit.id);
      out.push(hit);
    }
  }
  return out;
}

function takeCategory(items, category, used, limit) {
  const out = [];
  for (const item of items) {
    if (out.length >= limit) break;
    if (item.category !== category || used.has(item.id)) continue;
    used.add(item.id);
    out.push(item);
  }
  return out;
}

/**
 * Only sections with real assets are returned.
 * On Site / Offices / Events / Company Life omitted — no photo packs in repo.
 */
export function buildJournalNarrative(catalog) {
  const used = new Set();

  const featured = uniqueBySlug(catalog, FEATURED_SLUGS, used);
  // fill featured from architecture if needed
  if (featured.length < 4) {
    for (const item of catalog) {
      if (featured.length >= 6) break;
      if (used.has(item.id) || item.category !== 'architecture') continue;
      used.add(item.id);
      featured.push(item);
    }
  }

  const architecture = takeCategory(catalog, 'architecture', used, 18);
  const interiors = takeCategory(catalog, 'interior', used, 14);
  const focus = uniqueBySlug(catalog, FOCUS_SLUGS, used);

  const sections = [
    {id: 'featured', en: 'Featured', ar: 'مميز', count: featured.length},
    architecture.length
      ? {id: 'architecture', en: 'Architecture', ar: 'عمارة', count: architecture.length}
      : null,
    interiors.length
      ? {id: 'interiors', en: 'Interiors', ar: 'تصميم داخلي', count: interiors.length}
      : null,
    focus.length
      ? {id: 'focus', en: 'Projects in Focus', ar: 'مشاريع في الواجهة', count: focus.length}
      : null,
  ].filter(Boolean);

  return {featured, architecture, interiors, focus, sections};
}

/** Homepage teaser — max 6 real images, asymmetric mix from available assets only. */
export function buildHomeGalleryTeaser(locale) {
  const catalog = buildJournalCatalog(locale);
  const picks = [];
  const used = new Set();

  const want = [
    ...FEATURED_SLUGS.slice(0, 2),
    'reception-hall-private-villa',
    'majlis-and-dining',
    'industrial-facility-musaffah-m42',
    'private-villa-khalifa-se24',
  ];

  for (const slug of want) {
    const hit = catalog.find((i) => i.slug === slug && !used.has(i.id));
    if (hit) {
      used.add(hit.id);
      picks.push(hit);
    }
  }

  while (picks.length < 6) {
    const next = catalog.find((i) => !used.has(i.id));
    if (!next) break;
    used.add(next.id);
    picks.push(next);
  }

  // Optional company editorial as last slot if under 6 and asset exists
  if (picks.length < 6 && roleImages.COMPANY_OVERVIEW) {
    picks.push({
      id: 'home-corporate',
      src: roleImages.COMPANY_OVERVIEW,
      label: locale === 'ar' ? 'أساس' : 'ASAS',
      category: 'architecture',
      caption: locale === 'ar' ? 'أساس' : 'ASAS',
    });
  }

  return picks.slice(0, 6);
}
