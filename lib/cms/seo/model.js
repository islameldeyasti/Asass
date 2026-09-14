/**
 * Page-level SEO record shape + checklist / length helpers.
 */

export function emptyPageSeo(overrides = {}) {
  return {
    key: '',
    type: 'page', // page|project|service|sector|blog|team|job|gallery
    labelEn: '',
    labelAr: '',
    path: '', // e.g. services/structural-engineering or '' for home
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    ogTitleEn: '',
    ogTitleAr: '',
    ogDescriptionEn: '',
    ogDescriptionAr: '',
    ogImage: '',
    ogImageFocal: '50% 50%',
    canonicalOverride: '',
    robotsIndex: true,
    robotsFollow: true,
    sitemapInclude: true,
    schemaType: '', // Organization|WebSite|Service|Article|Person|JobPosting|FAQPage|AboutPage|ContactPage|CreativeWork
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function lengthStatus(count, {goodMin, goodMax, warnMin, warnMax}) {
  if (count === 0) return 'bad';
  if (count >= goodMin && count <= goodMax) return 'good';
  if (count >= warnMin && count <= warnMax) return 'warn';
  return 'bad';
}

/** Title SERP guidance: ideal ~50–60 chars. */
export function titleLengthHint(str) {
  const count = String(str || '').trim().length;
  return {
    count,
    status: lengthStatus(count, {goodMin: 30, goodMax: 60, warnMin: 15, warnMax: 70}),
  };
}

/** Meta description guidance: ideal ~150–160 chars. */
export function descriptionLengthHint(str) {
  const count = String(str || '').trim().length;
  return {
    count,
    status: lengthStatus(count, {goodMin: 120, goodMax: 160, warnMin: 70, warnMax: 200}),
  };
}

function item(id, ok, label, severity = 'warn') {
  return {id, ok: Boolean(ok), label, severity: ok ? 'ok' : severity};
}

/**
 * Lightweight on-page SEO checklist for a page-seo record.
 * @returns {{score: number, max: number, items: Array<{id: string, ok: boolean, label: string, severity: string}>}}
 */
export function seoChecklist(record, {hasH1 = true, hasImageAlt = true} = {}) {
  const r = record || {};
  const titleEn = titleLengthHint(r.titleEn);
  const titleAr = titleLengthHint(r.titleAr);
  const descEn = descriptionLengthHint(r.descriptionEn);
  const descAr = descriptionLengthHint(r.descriptionAr);

  const items = [
    item('title-en', Boolean(String(r.titleEn || '').trim()), 'Title (EN) is set', 'error'),
    item('title-ar', Boolean(String(r.titleAr || '').trim()), 'Title (AR) is set', 'error'),
    item('title-en-length', titleEn.status === 'good', 'Title (EN) length is in range (30–60)', 'warn'),
    item('title-ar-length', titleAr.status === 'good', 'Title (AR) length is in range (30–60)', 'warn'),
    item(
      'description-en',
      Boolean(String(r.descriptionEn || '').trim()),
      'Meta description (EN) is set',
      'error',
    ),
    item(
      'description-ar',
      Boolean(String(r.descriptionAr || '').trim()),
      'Meta description (AR) is set',
      'error',
    ),
    item(
      'description-en-length',
      descEn.status === 'good',
      'Description (EN) length is in range (120–160)',
      'warn',
    ),
    item(
      'description-ar-length',
      descAr.status === 'good',
      'Description (AR) length is in range (120–160)',
      'warn',
    ),
    item('og-image', Boolean(String(r.ogImage || '').trim()), 'Open Graph image is set', 'warn'),
    item('h1', hasH1, 'Page has a single clear H1', 'warn'),
    item('image-alt', hasImageAlt, 'Primary images have alt text', 'warn'),
    item(
      'indexable',
      r.robotsIndex !== false,
      'Page is set to index',
      'info',
    ),
    item(
      'sitemap',
      r.sitemapInclude !== false,
      'Included in sitemap',
      'info',
    ),
  ];

  const score = items.filter((entry) => entry.ok).length;
  return {score, max: items.length, items};
}
