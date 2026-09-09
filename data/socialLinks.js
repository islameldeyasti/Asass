/**
 * ASAS social profile URLs — single source of truth for footer + floating bar.
 *
 * LinkedIn: public company page (asasengg.ae).
 * Instagram / Facebook / YouTube: replace PLACEHOLDER values with official
 * profile URLs when confirmed. Do not invent company-specific paths.
 */

export const SOCIAL_URL_PLACEHOLDER = {
  instagram: 'https://www.instagram.com/', // PLACEHOLDER — official ASAS Instagram
  facebook: 'https://www.facebook.com/', // PLACEHOLDER — official ASAS Facebook
  youtube: 'https://www.youtube.com/', // PLACEHOLDER — official ASAS YouTube
};

export const socialLinks = {
  linkedin: 'https://www.linkedin.com/company/asas-engineering',
  instagram: SOCIAL_URL_PLACEHOLDER.instagram,
  facebook: SOCIAL_URL_PLACEHOLDER.facebook,
  youtube: SOCIAL_URL_PLACEHOLDER.youtube,
};

/** Ordered network list — localize labels in UI via labelKey / ariaKey + t(). */
export const socialNetworks = [
  {
    id: 'linkedin',
    href: socialLinks.linkedin,
    labelKey: 'linkedin',
    ariaKey: 'onLinkedIn',
  },
  {
    id: 'instagram',
    href: socialLinks.instagram,
    labelKey: 'instagram',
    ariaKey: 'onInstagram',
  },
  {
    id: 'facebook',
    href: socialLinks.facebook,
    labelKey: 'facebook',
    ariaKey: 'onFacebook',
  },
  {
    id: 'youtube',
    href: socialLinks.youtube,
    labelKey: 'youtube',
    ariaKey: 'onYouTube',
  },
];
