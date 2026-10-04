export const ADMIN_LANG_COOKIE = 'asas_admin_lang';
export const ADMIN_THEME_COOKIE = 'asas_admin_theme';
export const ADMIN_THEME_STORAGE = 'asas-admin-theme';
export const ADMIN_LANGS = ['ar', 'en'];
const DUBAI_TZ = 'Asia/Dubai';

export function formatAdminDateTime(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: DUBAI_TZ,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatAdminDate(value) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: DUBAI_TZ,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function summarizeAuditDetails(details) {
  if (details == null || details === '') return '—';
  let data = details;
  if (typeof details === 'string') {
    try {
      data = JSON.parse(details);
    } catch {
      return details.length > 80 ? `${details.slice(0, 77)}…` : details;
    }
  }
  if (typeof data !== 'object') return String(data);
  const parts = [data.module, data.number, data.action, data.reason].filter(Boolean);
  if (parts.length) return parts.join(' · ');
  const compact = JSON.stringify(data);
  return compact.length > 80 ? `${compact.slice(0, 77)}…` : compact;
}

export function normalizeAdminLang(value) {
  return value === 'ar' ? 'ar' : 'en';
}

export function normalizeAdminTheme(value) {
  return value === 'dark' ? 'dark' : 'light';
}

export async function readAdminLangCookie() {
  const {cookies} = await import('next/headers');
  const jar = await cookies();
  return normalizeAdminLang(jar.get(ADMIN_LANG_COOKIE)?.value);
}

export async function readAdminThemeCookie() {
  const {cookies} = await import('next/headers');
  const jar = await cookies();
  return normalizeAdminTheme(jar.get(ADMIN_THEME_COOKIE)?.value);
}

export function writeAdminLangCookie(lang) {
  const next = normalizeAdminLang(lang);
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${ADMIN_LANG_COOKIE}=${next}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  try {
    window.localStorage.setItem(ADMIN_LANG_COOKIE, next);
  } catch {
    // ignore
  }
  return next;
}

export function writeAdminThemeCookie(theme) {
  const next = normalizeAdminTheme(theme);
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${ADMIN_THEME_COOKIE}=${next}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  try {
    window.localStorage.setItem(ADMIN_THEME_STORAGE, next);
  } catch {
    // ignore
  }
  return next;
}
