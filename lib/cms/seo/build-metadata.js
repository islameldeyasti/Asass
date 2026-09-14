/**
 * Build Next.js Metadata for a public route from page-seo + global SEO settings.
 */

import {getSeoSettings} from '../seo-store';
import {getPageSeo} from './page-seo-store';

const DEFAULT_TEMPLATE = '%page% | ASAS Engineering';

function stripSlash(value = '') {
  return String(value || '').replace(/\/+$/, '');
}

function joinUrl(base, ...parts) {
  const root = stripSlash(base || 'https://www.asasengg.ae');
  const path = parts
    .flatMap((part) => String(part || '').split('/'))
    .filter(Boolean)
    .join('/');
  return path ? `${root}/${path}` : root;
}

function pickLocale(locale, enValue, arValue) {
  return locale === 'ar' ? arValue || enValue || '' : enValue || arValue || '';
}

function applyTitleTemplate(pageTitle, template) {
  const tpl = String(template || DEFAULT_TEMPLATE);
  const page = String(pageTitle || '').trim();
  if (!page) return tpl.replace(/%page%/gi, 'ASAS').trim();
  if (tpl.includes('%page%')) return tpl.replace(/%page%/gi, page);
  return `${page} | ${tpl}`.replace(/\s+\|\s+\|/g, ' | ');
}

function resolveTitle({
  customTitle,
  fallbackTitle,
  template,
}) {
  const custom = String(customTitle || '').trim();
  if (custom) return custom; // custom titles are used as-is (no template)
  const page = String(fallbackTitle || '').trim();
  return applyTitleTemplate(page, template);
}

function absoluteImage(base, image) {
  const src = String(image || '').trim();
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  return joinUrl(base, src.replace(/^\//, ''));
}

/**
 * @param {{
 *   locale: string,
 *   path?: string,
 *   type?: string,
 *   fallbackTitle?: string,
 *   fallbackTitleAr?: string,
 *   fallbackDescription?: string,
 *   fallbackDescriptionAr?: string,
 *   fallbackImage?: string,
 *   schemaType?: string,
 * }} args
 */
export async function buildRouteMetadata({
  locale = 'en',
  path = '',
  type = 'page',
  fallbackTitle = '',
  fallbackTitleAr = '',
  fallbackDescription = '',
  fallbackDescriptionAr = '',
  fallbackImage = '',
  schemaType = '',
} = {}) {
  const key = `${type}:${path || 'home'}`;
  const [settings, pageSeo] = await Promise.all([getSeoSettings(), getPageSeo(key)]);

  const base = stripSlash(settings.canonicalBase || 'https://www.asasengg.ae');
  const ar = locale === 'ar';

  const template = ar
    ? settings.titleTemplateAr || settings.titleTemplateEn || DEFAULT_TEMPLATE
    : settings.titleTemplateEn || DEFAULT_TEMPLATE;

  const title = resolveTitle({
    customTitle: pickLocale(locale, pageSeo?.titleEn, pageSeo?.titleAr),
    fallbackTitle: pickLocale(locale, fallbackTitle, fallbackTitleAr),
    template,
  });

  const description =
    pickLocale(locale, pageSeo?.descriptionEn, pageSeo?.descriptionAr) ||
    pickLocale(locale, fallbackDescription, fallbackDescriptionAr) ||
    pickLocale(locale, settings.defaultDescriptionEn, settings.defaultDescriptionAr);

  const ogTitle =
    pickLocale(locale, pageSeo?.ogTitleEn, pageSeo?.ogTitleAr) ||
    title;

  const ogDescription =
    pickLocale(locale, pageSeo?.ogDescriptionEn, pageSeo?.ogDescriptionAr) ||
    description;

  const ogImageRaw =
    pageSeo?.ogImage || fallbackImage || settings.defaultOgImage || '';
  const ogImage = absoluteImage(base, ogImageRaw);

  const canonicalPath = String(pageSeo?.canonicalOverride || '').trim()
    || joinUrl(base, locale, path);
  const canonical = /^https?:\/\//i.test(canonicalPath)
    ? canonicalPath
    : joinUrl(base, canonicalPath.replace(/^\//, ''));

  const enUrl = joinUrl(base, 'en', path);
  const arUrl = joinUrl(base, 'ar', path);

  const robotsIndex =
    pageSeo?.robotsIndex !== undefined && pageSeo?.robotsIndex !== null
      ? Boolean(pageSeo.robotsIndex)
      : settings.robotsIndex !== false;
  const robotsFollow =
    pageSeo?.robotsFollow !== undefined && pageSeo?.robotsFollow !== null
      ? Boolean(pageSeo.robotsFollow)
      : settings.robotsFollow !== false;

  const twitterCard = settings.twitterCardType || 'summary_large_image';

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: enUrl,
        ar: arUrl,
        'x-default': enUrl,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      type: schemaType === 'Article' || pageSeo?.schemaType === 'Article' ? 'article' : 'website',
      locale: ar ? 'ar_AE' : 'en_AE',
      alternateLocale: ar ? 'en_AE' : 'ar_AE',
      siteName: pickLocale(locale, settings.siteNameEn, settings.siteNameAr),
      images: ogImage ? [{url: ogImage}] : undefined,
    },
    robots: {
      index: robotsIndex,
      follow: robotsFollow,
    },
    twitter: {
      card: twitterCard,
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
      site: settings.twitterHandle || undefined,
      creator: settings.twitterHandle || undefined,
    },
    other: settings.searchConsoleVerification
      ? {'google-site-verification': settings.searchConsoleVerification}
      : undefined,
  };
}
