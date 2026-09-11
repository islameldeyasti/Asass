import {galleryItems} from '@/data/gallery';
import {projects} from '@/data/projects';

export const GALLERY_FILTERS = [
  {id: 'all', en: 'All', ar: 'الكل'},
  {id: 'architecture', en: 'Architecture', ar: 'عمارة'},
  {id: 'engineering', en: 'Engineering', ar: 'هندسة'},
  {id: 'interiors', en: 'Interiors', ar: 'تصميم داخلي'},
  {id: 'infrastructure', en: 'Infrastructure', ar: 'بنية تحتية'},
];

const STORY_SLUGS = [
  'residential-building-al-raha-rbw2',
  'private-villa-shakhbout-w01',
  'reception-hall-private-villa',
  'emirates-private-school',
];

const STRIP_SLUGS = [
  'showroom-musaffah-m42',
  'private-villa-khalifa-se24',
  'american-international-school',
  'majlis-and-dining',
  'private-villa-mbz-z14',
  'restaurant-interior',
  'industrial-facility-musaffah-m15',
];

export function pad(n) {
  return String(n).padStart(2, '0');
}

function disciplineOf(item, project) {
  if (item.category === 'interior' || project?.category === 'interior-design') return 'interiors';
  if (project?.category === 'infrastructure' || /traffic|access/i.test(item.title || '')) {
    return 'infrastructure';
  }
  if (project?.category === 'industrial') return 'engineering';
  return 'architecture';
}

function labelOf(discipline, ar) {
  const row = GALLERY_FILTERS.find((f) => f.id === discipline);
  return row ? (ar ? row.ar : row.en) : ar ? 'عمارة' : 'Architecture';
}

export function buildGalleryCatalog(locale) {
  const ar = locale === 'ar';
  const bySlug = new Map(projects.map((p) => [p.slug, p]));

  return galleryItems.map((item) => {
    const project = item.slug ? bySlug.get(item.slug) : null;
    const discipline = disciplineOf(item, project);
    return {
      ...item,
      label: project ? (ar ? project.titleAr : project.title) : ar ? item.titleAr : item.title,
      href: project ? `/${locale}/projects/${project.slug}` : null,
      location:
        (ar ? project?.locationShortAr || project?.locationAr : project?.locationShort || project?.location) ||
        (ar ? 'أبوظبي، الإمارات' : 'Abu Dhabi, UAE'),
      description: ar ? project?.descriptionAr : project?.description,
      year: project?.year || null,
      discipline,
      disciplineLabel: labelOf(discipline, ar),
    };
  });
}

function take(catalog, slug, used) {
  const hit = catalog.find((i) => i.slug === slug && !used.has(i.id));
  if (hit) {
    used.add(hit.id);
    return hit;
  }
  const fallback = catalog.find((i) => !used.has(i.id));
  if (fallback) used.add(fallback.id);
  return fallback || null;
}

function takeExtra(catalog, slug, used) {
  const hit = catalog.find((i) => i.slug === slug && !used.has(i.id));
  if (hit) {
    used.add(hit.id);
    return hit;
  }
  return null;
}

export function buildGalleryNarrative(catalog) {
  const used = new Set();

  const featured =
    take(catalog, 'residential-building-al-raha-rbw2', used) ||
    catalog.find((i) => i.id.startsWith('g-006')) ||
    catalog[0];
  if (featured) used.add(featured.id);

  const stories = STORY_SLUGS.map((slug, index) => {
    const primary = take(catalog, slug, used);
    if (!primary) return null;
    const secondary = takeExtra(catalog, slug, used);
    return {
      id: `story-${slug}`,
      layout: ['vertical-meta', 'edge-landscape', 'split-levels', 'navy-feature'][index],
      primary,
      secondary,
      meta: primary,
    };
  }).filter(Boolean);

  const strip = STRIP_SLUGS.map((slug) => take(catalog, slug, used)).filter(Boolean);

  const indexMap = new Map();
  catalog.forEach((item) => {
    const key = item.slug || item.id;
    if (!indexMap.has(key)) indexMap.set(key, item);
  });

  return {
    featured,
    stories,
    strip,
    index: [...indexMap.values()],
  };
}
