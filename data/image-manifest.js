/**
 * ASAS Global Image Manifest — exclusive role ownership.
 * Rule: one logical source image → one primary website role.
 * Real project photos never used as generic section wallpaper.
 * Responsive AVIF siblings of the same role are not duplicates.
 */

const trafficStudies = {
  id: 'traffic-access-studies',
  sourceProfilePage: 34,
  classification: 'TECHNICAL_DRAWING',
  qualityTier: 'B_PROJECT_CARD',
  status: 'APPROVED_FOR_CARDS',
  card: '/assets/asas/real-projects/asas-traffic-access-studies-card.webp',
  portfolio: '/assets/asas/real-projects/asas-traffic-access-studies-portfolio.webp',
  mobile: '/assets/asas/real-projects/asas-traffic-access-studies-mobile.webp',
};

const unavailableProject = (id, sourceProfilePage, qualityTier) => ({
  id,
  sourceProfilePage,
  classification: 'REAL_PROJECT_REFERENCE',
  qualityTier,
  status: 'NEED_ORIGINAL_SOURCE',
  card: null,
  portfolio: null,
  mobile: null,
  gallery: [],
});

/** Magnific-verified real project assets under /projects-generated/<slug>/ */
const PG = '/assets/asas/projects-generated';
const approvedGeneratedProject = (id, sourceProfilePage, slug, files, qualityTier = 'A_PROJECT_HERO') => {
  const paths = files.map((file) => `${PG}/${slug}/${file}`);
  const hero = paths[0] || null;
  return {
    id,
    sourceProfilePage,
    classification: 'PROJECT_PHOTO',
    qualityTier,
    status: 'APPROVED_FOR_CARDS',
    card: hero,
    portfolio: hero,
    mobile: paths[1] || hero,
    gallery: paths,
  };
};

/** Real project mappings only — never inject generated editorial here. */
export const projectImages = {
  'four-towers-al-nahda': approvedGeneratedProject(
    'four-towers-al-nahda',
    30,
    'four-towers-al-nahda',
    [
      'four-towers-al-nahda-01-hero.webp',
      'four-towers-al-nahda-02-front.webp',
      'four-towers-al-nahda-03-left-angle.webp',
      'four-towers-al-nahda-05-detail.webp',
    ],
  ),
  'building-mbz-musaffah-m26': approvedGeneratedProject(
    'commercial-residential-building-m26',
    31,
    'building-mbz-musaffah-m26',
    ['building-mbz-musaffah-m26-01-hero.webp', 'building-mbz-musaffah-m26-02-front.webp'],
  ),
  'building-khalifa-city-msh36': approvedGeneratedProject(
    'commercial-residential-building-msh36',
    31,
    'building-khalifa-city-msh36',
    [
      'building-khalifa-city-msh36-01-hero.webp',
      'building-khalifa-city-msh36-02-front.webp',
      'building-khalifa-city-msh36-03-left-angle.webp',
    ],
  ),
  'residential-building-al-raha-rbw2': unavailableProject('residential-building-al-raha-rbw2', 31, 'E_NEED_ORIGINAL_SOURCE'),
  'mbz-city-towers': approvedGeneratedProject(
    'mbz-city-towers',
    32,
    'mbz-city-towers',
    ['mbz-city-towers-01-hero.webp', 'mbz-city-towers-02-front.webp'],
  ),
  'traffic-access-studies': trafficStudies,
  'culture-private-school': approvedGeneratedProject(
    'culture-private-school',
    35,
    'culture-private-school',
    [
      'culture-private-school-01-hero.webp',
      'culture-private-school-02-front.webp',
      'culture-private-school-03-left-angle.webp',
      'culture-private-school-04-right-angle.webp',
      'culture-private-school-05-detail.webp',
    ],
  ),
  'emirates-private-school': unavailableProject('emirates-private-school', 35, 'D_REFERENCE_ONLY'),
  'compound-villas-portfolio': approvedGeneratedProject(
    'compound-villas',
    36,
    'compound-villas-portfolio',
    ['compound-villas-portfolio-01-hero.webp'],
  ),
  'private-villa-shakhbout-w01': unavailableProject('private-villa-shakhbout-w01', 37, 'E_NEED_ORIGINAL_SOURCE'),
  'private-villa-khalifa-se24': unavailableProject('private-villa-khalifa-se24', 37, 'E_NEED_ORIGINAL_SOURCE'),
  'residential-villa-al-shamkha-sh3': unavailableProject('residential-villa-al-shamkha-sh3', 38, 'E_NEED_ORIGINAL_SOURCE'),
  'residential-villa-riyadh-rd32': unavailableProject('residential-villa-riyadh-rd32', 38, 'E_NEED_ORIGINAL_SOURCE'),
  'residential-villa-bani-yas-eb11-01': unavailableProject('residential-villa-bani-yas-eb11-01', 38, 'E_NEED_ORIGINAL_SOURCE'),
  'reception-hall-private-villa': unavailableProject('reception-hall-private-villa', 41, 'D_REFERENCE_ONLY'),
  'majlis-and-dining': unavailableProject('majlis-and-dining-private-villa', 41, 'D_REFERENCE_ONLY'),
  'restaurant-interior': unavailableProject('restaurant-interior', 42, 'E_NEED_ORIGINAL_SOURCE'),
  'hotel-lobby-interior': unavailableProject('hotel-lobby-interior', 42, 'E_NEED_ORIGINAL_SOURCE'),
};

const R = '/assets/asas/roles';
const E = '/assets/asas/generated-editorial';
const S = '/assets/asas/services';
const C = '/assets/asas/corporate';
/** Magnific-validated READY production assets (IMAGE ID filenames). */
const G = '/assets/asas/generated/ready';

/**
 * Exclusive role → single asset.
 * Do not map the same path to two roles.
 * Magnific READY deployments use IMAGE ID filenames under /generated/ready/.
 */
export const roleImages = {
  // P0 authenticity: Magnific HOME-HERO-001/003/004/005 removed from named-project slides.
  // No verified authentic project photos exist yet — restored prior approved editorial roles.
  HOME_HERO: `${E}/asas-editorial-homepage-hero.webp`,
  HOME_ABOUT: `${R}/asas-role-home-about.webp`,
  HOME_TEAM: `${R}/asas-role-home-team.webp`,
  HOME_SLIDE_EDUCATION: `${R}/asas-role-home-slide-education.webp`,
  HOME_SLIDE_VILLAS: `${R}/asas-role-home-slide-villas.webp`,
  HOME_SLIDE_INTERIORS: `${R}/asas-role-home-slide-interiors.webp`,
  // Traffic slide may share the project ecosystem asset (exception).
  HOME_SLIDE_TRAFFIC: trafficStudies.portfolio,

  // Homepage sector mosaic — exclusive from /sectors page assets
  HOME_SECTOR_TOWERS: `${R}/asas-role-home-sector-towers.webp`,
  HOME_SECTOR_BUILDINGS: `${R}/asas-role-home-sector-buildings.webp`,
  HOME_SECTOR_INFRASTRUCTURE: `${R}/asas-role-home-sector-infrastructure.webp`,
  HOME_SECTOR_EDUCATION: `${R}/asas-role-home-sector-education.webp`,
  HOME_SECTOR_VILLAS: `${R}/asas-role-home-sector-villas.webp`,
  HOME_SECTOR_INTERIORS: `${R}/asas-role-home-sector-interiors.webp`,

  // Homepage discipline tabs — exclusive from /services page assets
  HOME_DISC_ARCHITECTURE: `${R}/asas-role-home-disc-architecture.webp`,
  HOME_DISC_STRUCTURAL: `${R}/asas-role-home-disc-structural.webp`,
  HOME_DISC_MEP: `${R}/asas-role-home-disc-mep.webp`,
  HOME_DISC_QS: `${R}/asas-role-home-disc-qs.webp`,
  HOME_DISC_PM: `${R}/asas-role-home-disc-pm.webp`,

  ABOUT_HERO: `${G}/ABOUT-HERO-001.webp`,
  ABOUT_FEATURED: `${R}/asas-role-about-featured.webp`,

  CAREERS_HERO: `${G}/CAREERS-HERO-001.webp`,
  CONTACT_HERO: `${G}/CONTACT-HERO-001.webp`,
  DOWNLOADS_HERO: `${G}/DOWNLOADS-HERO-001.webp`,
  ENQUIRY_HERO: `${G}/ENQUIRY-HERO-001.webp`,

  TEAM_HERO: `${G}/TEAM-HERO-001.webp`,
  TEAM_PHILOSOPHY: `${R}/asas-role-team-philosophy.webp`,

  // COMPANY_HERO / PROJECTS_HERO kept on prior assets — Magnific outputs were WRONG_RATIO
  COMPANY_HERO: `${R}/asas-role-company-profile-hero.webp`,
  COMPANY_OVERVIEW: `${C}/asas-editorial-corporate-team.webp`,

  SERVICES_HERO: `${G}/SERVICES-HERO-001.webp`,
  // Regenerated anonymously (no façade branding / no named landmarks)
  SECTORS_HERO: `/assets/asas/generated/auto/sectors/SECTORS-HERO-001.webp`,
  PROJECTS_HERO: `${R}/asas-role-projects-hero.webp`,

  // Regenerated anonymously (no façade branding)
  SECTOR_TOWERS: `/assets/asas/generated/auto/sectors/SECTOR-HERO-towers-high-rise.webp`,
  SECTOR_BUILDINGS: `${G}/SECTOR-HERO-commercial-residential-buildings.webp`,
  SECTOR_INDUSTRIAL: `${G}/SECTOR-HERO-industrial-showrooms.webp`,
  SECTOR_INFRASTRUCTURE: `${G}/SECTOR-HERO-infrastructure-urban-planning.webp`,
  SECTOR_EDUCATION: `/assets/asas/generated/auto/sectors/SECTOR-HERO-education.webp`,
  SECTOR_VILLAS: `${G}/SECTOR-HERO-villas-compounds-palaces.webp`,
  SECTOR_INTERIORS: `${G}/SECTOR-HERO-interior-hospitality-retail.webp`,

  SERVICE_ARCHITECTURE: `${G}/SERVICE-HERO-architectural-design.webp`,
  SERVICE_STRUCTURAL: `/assets/asas/generated/auto/services/SERVICE-HERO-civil-structural-engineering.webp`,
  SERVICE_MEP: `${G}/SERVICE-HERO-mep-engineering-design.webp`,
  SERVICE_QS: `/assets/asas/generated/auto/services/SERVICE-HERO-quantities-cost.webp`,
  SERVICE_PM: `${G}/SERVICE-HERO-project-management.webp`,
  SERVICE_SUPERVISION: `${G}/SERVICE-HERO-construction-supervision.webp`,
  SERVICE_INFRASTRUCTURE: `${G}/SERVICE-HERO-infrastructure-urban-planning.webp`,
  SERVICE_TRAFFIC: `${G}/SERVICE-HERO-traffic-studies.webp`,
  SERVICE_SUSTAINABILITY: `/assets/asas/generated/auto/services/SERVICE-HERO-sustainability-green-building.webp`,
  SERVICE_INTERIOR: `${G}/SERVICE-HERO-interior-design.webp`,
  SERVICE_LANDSCAPE: `${G}/SERVICE-HERO-landscape-design.webp`,
  SERVICE_STUDIES: `${G}/SERVICE-HERO-studies-specifications.webp`,
  SERVICE_HSE: `${G}/SERVICE-HERO-health-safety-fire-design.webp`,
};

/** Shared enquiry/CTA band photography (darkened by page CSS veils). */
export const ctaBandImages = {
  services: roleImages.ENQUIRY_HERO,
  projects: roleImages.ENQUIRY_HERO,
  about: roleImages.ABOUT_FEATURED,
  careers: roleImages.CAREERS_HERO,
  team: roleImages.TEAM_HERO,
  enquiry: roleImages.ENQUIRY_HERO,
  company: roleImages.COMPANY_HERO,
};

/** Company profile official-document card preview (reuse downloads editorial). */
export const companyDocumentImage = roleImages.DOWNLOADS_HERO;

/** Homepage-only sector + discipline maps (never reuse sectorImages/serviceImages). */
export const homeSectorImages = {
  'towers-high-rise': roleImages.HOME_SECTOR_TOWERS,
  'commercial-residential-buildings': roleImages.HOME_SECTOR_BUILDINGS,
  'infrastructure-urban-planning': roleImages.HOME_SECTOR_INFRASTRUCTURE,
  education: roleImages.HOME_SECTOR_EDUCATION,
  'villas-compounds-palaces': roleImages.HOME_SECTOR_VILLAS,
  'interior-hospitality-retail': roleImages.HOME_SECTOR_INTERIORS,
};

export const homeDisciplineImages = {
  'architectural-design': roleImages.HOME_DISC_ARCHITECTURE,
  'civil-structural-engineering': roleImages.HOME_DISC_STRUCTURAL,
  'mep-engineering-design': roleImages.HOME_DISC_MEP,
  'quantities-cost': roleImages.HOME_DISC_QS,
  'project-management': roleImages.HOME_DISC_PM,
};

/** @deprecated Prefer roleImages — kept for gradual migration aliases */
export const generatedEditorialImages = {
  homepageHero: roleImages.HOME_HERO,
  buildingsSector: roleImages.SECTOR_BUILDINGS,
  educationSector: roleImages.SECTOR_EDUCATION,
  villasSector: roleImages.SECTOR_VILLAS,
  interiorsSector: roleImages.SECTOR_INTERIORS,
  industrialSector: roleImages.SECTOR_INDUSTRIAL,
  technicalCoordination: roleImages.SERVICE_PM,
  siteSupervision: roleImages.SERVICE_SUPERVISION,
  corporateTeam: roleImages.COMPANY_OVERVIEW,
  // Role shortcuts used by updated pages
  ...roleImages,
};

export const sectorImages = {
  'towers-high-rise': roleImages.SECTOR_TOWERS,
  'commercial-residential-buildings': roleImages.SECTOR_BUILDINGS,
  'industrial-showrooms': roleImages.SECTOR_INDUSTRIAL,
  'infrastructure-urban-planning': roleImages.SECTOR_INFRASTRUCTURE,
  education: roleImages.SECTOR_EDUCATION,
  'villas-compounds-palaces': roleImages.SECTOR_VILLAS,
  'interior-hospitality-retail': roleImages.SECTOR_INTERIORS,
};

/** Optional sector crop hints — defaults to center center when omitted. */
export const sectorImagePositions = {
  'towers-high-rise': 'center 28%',
  'infrastructure-urban-planning': 'center 40%',
  education: 'center 35%',
};

/** Canonical sector image resolver (listing, detail, service Sectors Served). */
export function getSectorImage(slug) {
  const src = sectorImages[slug] || null;
  return {
    src,
    imagePosition: sectorImagePositions[slug] || 'center center',
  };
}

export const serviceImages = {
  'architectural-design': roleImages.SERVICE_ARCHITECTURE,
  'civil-structural-engineering': roleImages.SERVICE_STRUCTURAL,
  'mep-engineering-design': roleImages.SERVICE_MEP,
  'quantities-cost': roleImages.SERVICE_QS,
  'project-management': roleImages.SERVICE_PM,
  'construction-supervision': roleImages.SERVICE_SUPERVISION,
  'infrastructure-urban-planning': roleImages.SERVICE_INFRASTRUCTURE,
  'traffic-studies': roleImages.SERVICE_TRAFFIC,
  'sustainability-green-building': roleImages.SERVICE_SUSTAINABILITY,
  'interior-design': roleImages.SERVICE_INTERIOR,
  'studies-specifications': roleImages.SERVICE_STUDIES,
  'health-safety-fire-design': roleImages.SERVICE_HSE,
  'landscape-design': roleImages.SERVICE_LANDSCAPE,
};

/** Optional listing/detail crop hints — defaults to center center when omitted. */
export const serviceImagePositions = {
  'quantities-cost': 'center 32%',
  'civil-structural-engineering': 'center 40%',
  'sustainability-green-building': 'center 35%',
  'construction-supervision': 'center 30%',
};

/** Canonical service image resolver (listing cards + detail heroes). */
export function getServiceImage(slug) {
  const src = serviceImages[slug] || null;
  return {
    src,
    imagePosition: serviceImagePositions[slug] || 'center center',
  };
}

export const heroImages = {
  homepage: {src: roleImages.HOME_HERO, classification: 'GENERATED_EDITORIAL', project: null, alt: '', imageStatus: 'AUTHENTIC_IMAGE_PENDING'},
  about: {src: roleImages.ABOUT_HERO, classification: 'GENERATED_EDITORIAL', project: null, alt: ''},
  careers: {src: roleImages.CAREERS_HERO, classification: 'GENERATED_EDITORIAL', project: null, alt: ''},
  contact: {src: roleImages.CONTACT_HERO, classification: 'GENERATED_EDITORIAL', project: null, alt: ''},
  downloads: {src: roleImages.DOWNLOADS_HERO, classification: 'GENERATED_EDITORIAL', project: null, alt: ''},
  enquiry: {src: roleImages.ENQUIRY_HERO, classification: 'GENERATED_EDITORIAL', project: null, alt: ''},
  team: {src: roleImages.TEAM_HERO, classification: 'GENERATED_EDITORIAL', project: null, alt: ''},
  services: {src: roleImages.SERVICES_HERO, classification: 'GENERATED_EDITORIAL', project: null, alt: ''},
  sectors: {src: roleImages.SECTORS_HERO, classification: 'GENERATED_EDITORIAL', project: null, alt: '', imageStatus: 'APPROVED'},
  projects: {src: roleImages.PROJECTS_HERO, classification: 'GENERATED_EDITORIAL', project: null, alt: ''},
  companyProfile: {src: roleImages.COMPANY_HERO, classification: 'GENERATED_EDITORIAL', project: null, alt: ''},
};

/**
 * P0 authenticity follow-ups for Magnific IMAGE IDs that were removed from live slots.
 * Does not affect rendering — tracking for authentic capture / next generation batch.
 */
export const magnificImageStatus = {
  'HOME-HERO-001': 'AUTHENTIC_IMAGE_PENDING',
  'HOME-HERO-003': 'AUTHENTIC_IMAGE_PENDING',
  'HOME-HERO-004': 'AUTHENTIC_IMAGE_PENDING',
  'HOME-HERO-005': 'AUTHENTIC_IMAGE_PENDING',
  'SECTORS-HERO-001': 'APPROVED',
  'SECTOR-HERO-towers-high-rise': 'APPROVED',
  'SECTOR-HERO-education': 'APPROVED',
};

export const roleImageStatus = {
  HOME_HERO: 'AUTHENTIC_IMAGE_PENDING',
  HOME_SLIDE_EDUCATION: 'AUTHENTIC_IMAGE_PENDING',
  HOME_SLIDE_VILLAS: 'AUTHENTIC_IMAGE_PENDING',
  HOME_SLIDE_INTERIORS: 'AUTHENTIC_IMAGE_PENDING',
  SECTORS_HERO: 'APPROVED',
  SECTOR_TOWERS: 'APPROVED',
  SECTOR_EDUCATION: 'APPROVED',
};

export function getRoleImage(role) {
  return roleImages[role] || null;
}
