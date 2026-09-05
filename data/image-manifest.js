const unavailableProject = (id, sourceProfilePage, qualityTier) => ({
  id,
  sourceProfilePage,
  classification: 'REAL_PROJECT_REFERENCE',
  qualityTier,
  status: 'NEED_ORIGINAL_SOURCE',
  card: null,
  portfolio: null,
  mobile: null,
});

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

export const projectImages = {
  'four-towers-al-nahda': unavailableProject('four-towers-al-nahda', 30, 'D_REFERENCE_ONLY'),
  'building-mbz-musaffah-m26': unavailableProject('commercial-residential-building-m26', 31, 'D_REFERENCE_ONLY'),
  'building-khalifa-city-msh36': unavailableProject('commercial-residential-building-msh36', 31, 'D_REFERENCE_ONLY'),
  'residential-building-al-raha-rbw2': unavailableProject('residential-building-al-raha-rbw2', 31, 'E_NEED_ORIGINAL_SOURCE'),
  'mbz-city-towers': unavailableProject('mbz-city-towers', 32, 'D_REFERENCE_ONLY'),
  'traffic-access-studies': trafficStudies,
  'culture-private-school': unavailableProject('culture-private-school', 35, 'D_REFERENCE_ONLY'),
  'emirates-private-school': unavailableProject('emirates-private-school', 35, 'D_REFERENCE_ONLY'),
  'compound-villas-portfolio': unavailableProject('compound-villas', 36, 'E_NEED_ORIGINAL_SOURCE'),
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

export const generatedEditorialImages = {
  homepageHero: '/assets/asas/generated-editorial/asas-editorial-homepage-hero.webp',
  buildingsSector: '/assets/asas/generated-editorial/asas-editorial-buildings-sector.webp',
  educationSector: '/assets/asas/generated-editorial/asas-editorial-education-sector.webp',
  villasSector: '/assets/asas/generated-editorial/asas-editorial-villas-sector.webp',
  interiorsSector: '/assets/asas/generated-editorial/asas-editorial-interiors-sector.webp',
  industrialSector: '/assets/asas/generated-editorial/asas-editorial-industrial-sector.webp',
  technicalCoordination: '/assets/asas/services/asas-editorial-technical-coordination.webp',
  siteSupervision: '/assets/asas/services/asas-editorial-site-supervision.webp',
  corporateTeam: '/assets/asas/corporate/asas-editorial-corporate-team.webp',
};

export const sectorImages = {
  'towers-high-rise': generatedEditorialImages.buildingsSector,
  'commercial-residential-buildings': generatedEditorialImages.buildingsSector,
  'industrial-showrooms': generatedEditorialImages.industrialSector,
  'infrastructure-urban-planning': trafficStudies.portfolio,
  education: generatedEditorialImages.educationSector,
  'villas-compounds-palaces': generatedEditorialImages.villasSector,
  'interior-hospitality-retail': generatedEditorialImages.interiorsSector,
};

export const serviceImages = {
  'architectural-design': generatedEditorialImages.buildingsSector,
  'civil-structural-engineering': generatedEditorialImages.technicalCoordination,
  'mep-engineering-design': generatedEditorialImages.technicalCoordination,
  'quantities-cost': generatedEditorialImages.technicalCoordination,
  'project-management': generatedEditorialImages.technicalCoordination,
  'construction-supervision': generatedEditorialImages.siteSupervision,
  'infrastructure-urban-planning': trafficStudies.card,
  'traffic-studies': trafficStudies.card,
  'sustainability-green-building': generatedEditorialImages.buildingsSector,
  'interior-design': generatedEditorialImages.interiorsSector,
  'studies-specifications': generatedEditorialImages.technicalCoordination,
  'health-safety-fire-design': generatedEditorialImages.technicalCoordination,
  'landscape-design': generatedEditorialImages.villasSector,
};

export const heroImages = {
  homepage: {
    src: generatedEditorialImages.homepageHero,
    classification: 'GENERATED_EDITORIAL',
    project: null,
    alt: '',
  },
  about: generatedEditorialImages.corporateTeam,
};
