/**
 * ASAS social profile URLs — single source of truth for footer + floating bar.
 */

export const socialLinks = {
  linkedin: 'https://www.linkedin.com/company/asas-engineering/home/',
  instagram: 'https://www.instagram.com/asas_engineering_consultancy/',
  facebook: 'https://www.facebook.com/profile.php?id=100063518202423&sk=photos',
  youtube: 'https://www.youtube.com/@AsasEngineering',
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
