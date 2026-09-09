/**
 * Locale helpers — path switching, dir/lang attributes.
 */

export const LOCALES = ['en', 'ar'];

export function normalizeLocale(locale) {
  return locale === 'ar' ? 'ar' : 'en';
}

/** Swap /en/... ↔ /ar/... while preserving the rest of the path. */
export function switchLocalePath(pathname, nextLocale) {
  const locale = normalizeLocale(nextLocale);
  const path = pathname || `/${locale}`;
  const parts = path.split('/');
  if (parts.length >= 2 && (parts[1] === 'en' || parts[1] === 'ar')) {
    parts[1] = locale;
    const next = parts.join('/') || `/${locale}`;
    return next.endsWith('/') && next.length > 4 ? next.slice(0, -1) : next;
  }
  return `/${locale}`;
}

export function localeDir(locale) {
  return normalizeLocale(locale) === 'ar' ? 'rtl' : 'ltr';
}

/**
 * Inline boot script — sets html lang/dir before paint (SSR-safe with suppressHydrationWarning).
 * Inject inside locale layout.
 */
export function localeBootScript(locale) {
  const lang = normalizeLocale(locale);
  const dir = localeDir(lang);
  return `(function(){var h=document.documentElement;h.lang=${JSON.stringify(lang)};h.dir=${JSON.stringify(dir)};h.setAttribute('data-locale',${JSON.stringify(lang)});h.classList.toggle('locale-ar',${lang === 'ar'});h.classList.toggle('locale-en',${lang === 'en'});})();`;
}
