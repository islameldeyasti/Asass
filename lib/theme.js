/** ASAS theme constants & helpers (client-safe). */

export const THEME_STORAGE_KEY = 'asas-theme';
export const THEME_PREFS = ['light', 'dark', 'system'];

export function resolveTheme(pref, systemDark) {
  const p = THEME_PREFS.includes(pref) ? pref : 'system';
  if (p === 'system') return systemDark ? 'dark' : 'light';
  return p;
}

export function applyThemeDom(pref, systemDark) {
  if (typeof document === 'undefined') return 'light';
  const resolved = resolveTheme(pref, systemDark);
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.setAttribute('data-theme-pref', pref);
  root.style.colorScheme = resolved;
  return resolved;
}

/** Inline blocking script — inject before paint to prevent FOUC. */
export const THEME_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var pref=localStorage.getItem(k)||'system';if(pref!=='light'&&pref!=='dark'&&pref!=='system')pref='system';var dark=window.matchMedia('(prefers-color-scheme: dark)').matches;var theme=pref==='system'?(dark?'dark':'light'):pref;var r=document.documentElement;r.setAttribute('data-theme',theme);r.setAttribute('data-theme-pref',pref);r.style.colorScheme=theme;}catch(e){}})();`;
