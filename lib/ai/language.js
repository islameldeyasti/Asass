/**
 * Detect Arabic vs English from user text (per message).
 * Mixed messages follow the dominant script.
 */

const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

export function detectLanguage(text = '', fallback = 'en') {
  const raw = String(text || '');
  if (!raw.trim()) return fallback === 'ar' ? 'ar' : 'en';

  let arabic = 0;
  let latin = 0;

  for (const ch of raw) {
    if (ARABIC_RE.test(ch)) arabic += 1;
    else if (/[A-Za-z]/.test(ch)) latin += 1;
  }

  if (arabic === 0 && latin === 0) return fallback === 'ar' ? 'ar' : 'en';
  if (arabic >= latin) return 'ar';
  return 'en';
}

export function dirForLanguage(language) {
  return language === 'ar' ? 'rtl' : 'ltr';
}

export function speechLocale(language) {
  return language === 'ar' ? 'ar-AE' : 'en-US';
}
