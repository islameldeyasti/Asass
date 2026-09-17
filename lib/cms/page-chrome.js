/**
 * Resolve bilingual page chrome (hero / CTA) from CMS page-copy with safe fallbacks.
 */

/** Prefix internal paths with locale; leave anchors, mailto, tel, and absolute URLs alone. */
export function localizeHref(href, locale) {
  if (!href) return href;
  const raw = String(href).trim();
  if (!raw) return raw;
  if (
    raw.startsWith('#') ||
    raw.startsWith('mailto:') ||
    raw.startsWith('tel:') ||
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('//')
  ) {
    return raw;
  }
  let path = raw.replace(/^\/(en|ar)(?=\/|$)/, '');
  if (!path.startsWith('/')) path = `/${path}`;
  if (path === '/') return `/${locale}`;
  return `/${locale}${path}`;
}

export function pickLocalized(copy, ar, enKey, arKey, fallbackEn = '', fallbackAr = '') {
  const en = copy?.[enKey];
  const arVal = copy?.[arKey];
  if (ar) {
    const value = arVal == null ? '' : String(arVal).trim();
    return value || fallbackAr;
  }
  const value = en == null ? '' : String(en).trim();
  return value || fallbackEn;
}

export function pickImage(copy, key, fallback = '') {
  const value = copy?.[key];
  if (value == null || String(value).trim() === '') return fallback;
  return String(value).trim();
}

export function pickFocal(copy, key, fallback = '50% 50%') {
  const value = copy?.[key];
  if (value == null || String(value).trim() === '') return fallback;
  return String(value).trim();
}

export function resolvePageChrome(copy, ar, fallbacks = {}) {
  return {
    heroImage: pickImage(copy, 'heroImage', fallbacks.heroImage || ''),
    heroImageFocal: pickFocal(copy, 'heroImageFocal', fallbacks.heroImageFocal || '50% 40%'),
    heroTitle: pickLocalized(
      copy,
      ar,
      'heroTitleEn',
      'heroTitleAr',
      fallbacks.heroTitleEn || '',
      fallbacks.heroTitleAr || '',
    ),
    heroLede: pickLocalized(
      copy,
      ar,
      'heroLedeEn',
      'heroLedeAr',
      fallbacks.heroLedeEn || '',
      fallbacks.heroLedeAr || '',
    ),
    heroCtaLabel: pickLocalized(
      copy,
      ar,
      'heroCtaLabelEn',
      'heroCtaLabelAr',
      fallbacks.heroCtaLabelEn || '',
      fallbacks.heroCtaLabelAr || '',
    ),
    heroCtaHref: pickImage(copy, 'heroCtaHref', fallbacks.heroCtaHref || ''),
    ctaImage: pickImage(copy, 'ctaImage', fallbacks.ctaImage || ''),
    ctaImageFocal: pickFocal(copy, 'ctaImageFocal', fallbacks.ctaImageFocal || '50% 40%'),
    ctaKicker: pickLocalized(
      copy,
      ar,
      'ctaKickerEn',
      'ctaKickerAr',
      fallbacks.ctaKickerEn || '',
      fallbacks.ctaKickerAr || '',
    ),
    ctaTitle: pickLocalized(
      copy,
      ar,
      'ctaTitleEn',
      'ctaTitleAr',
      fallbacks.ctaTitleEn || '',
      fallbacks.ctaTitleAr || '',
    ),
    ctaLede: pickLocalized(
      copy,
      ar,
      'ctaLedeEn',
      'ctaLedeAr',
      fallbacks.ctaLedeEn || '',
      fallbacks.ctaLedeAr || '',
    ),
    ctaPrimaryLabel: pickLocalized(
      copy,
      ar,
      'ctaPrimaryLabelEn',
      'ctaPrimaryLabelAr',
      fallbacks.ctaPrimaryLabelEn || '',
      fallbacks.ctaPrimaryLabelAr || '',
    ),
    ctaPrimaryHref: pickImage(copy, 'ctaPrimaryHref', fallbacks.ctaPrimaryHref || ''),
    ctaSecondaryLabel: pickLocalized(
      copy,
      ar,
      'ctaSecondaryLabelEn',
      'ctaSecondaryLabelAr',
      fallbacks.ctaSecondaryLabelEn || '',
      fallbacks.ctaSecondaryLabelAr || '',
    ),
    ctaSecondaryHref: pickImage(copy, 'ctaSecondaryHref', fallbacks.ctaSecondaryHref || ''),
  };
}

export function resolvePageChromeForLocale(copy, locale, fallbacks = {}) {
  const ar = locale === 'ar';
  const chrome = resolvePageChrome(copy, ar, fallbacks);
  return {
    ...chrome,
    heroCtaHref: localizeHref(chrome.heroCtaHref, locale),
    ctaPrimaryHref: localizeHref(chrome.ctaPrimaryHref, locale),
    ctaSecondaryHref: localizeHref(chrome.ctaSecondaryHref, locale),
  };
}
