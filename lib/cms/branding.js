/**
 * Central ASAS branding assets — Settings → Branding is the source of truth.
 * Client-safe: no Node/fs imports. Server loaders use getBranding from branding-server.js.
 */

export const BRAND_COLORS = {
  navy: '#070463',
  rust: '#A02315',
};

export const DEFAULT_BRANDING = {
  primaryLogo: '/brand/asas-logo-light.png',
  lightLogo: '/brand/asas-logo-light.png',
  darkLogo: '/brand/asas-logo-dark.png',
  headerLogoLight: '/brand/asas-logo-light.png',
  headerLogoDark: '/brand/asas-logo-dark.png',
  footerLogo: '/brand/asas-logo-dark.png',
  mobileLogo: '',
  favicon: '/favicon.ico',
  appleTouchIcon: '/brand/asas-mark-header.png',
  defaultOgImage: '/brand/asas-mark-header.png',
  printLogo: '/assets/asas/corporate/asas-letterhead-mark.png',
  letterheadLogo: '/assets/asas/corporate/asas-letterhead-lockup.png',
  emailLogo: '/brand/asas-logo-light.png',
  navy: BRAND_COLORS.navy,
  rust: BRAND_COLORS.rust,
};

export function normalizeBranding(input = {}) {
  const next = {...DEFAULT_BRANDING, ...(input || {})};
  if (!next.lightLogo) next.lightLogo = next.primaryLogo || DEFAULT_BRANDING.lightLogo;
  if (!next.darkLogo) next.darkLogo = DEFAULT_BRANDING.darkLogo;
  if (!next.headerLogoLight) next.headerLogoLight = next.lightLogo;
  if (!next.headerLogoDark) next.headerLogoDark = next.darkLogo;
  if (!next.footerLogo) next.footerLogo = next.darkLogo;
  if (!next.primaryLogo) next.primaryLogo = next.lightLogo;
  return next;
}
