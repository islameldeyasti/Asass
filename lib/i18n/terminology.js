/**
 * Canonical ASAS Arabic engineering terminology.
 * Use these labels site-wide for consistency (Gulf / UAE corporate Arabic).
 */

export const terminology = {
  engineeringConsultancy: {
    en: 'Engineering Consultancy',
    ar: 'الاستشارات الهندسية',
  },
  projectManagement: {
    en: 'Project Management',
    ar: 'إدارة المشاريع',
  },
  constructionSupervision: {
    en: 'Construction Supervision',
    ar: 'الإشراف على التنفيذ',
  },
  architecturalDesign: {
    en: 'Architectural Design',
    ar: 'التصميم المعماري',
  },
  structuralEngineering: {
    en: 'Structural Engineering',
    ar: 'الهندسة الإنشائية',
  },
  mepEngineering: {
    en: 'MEP Engineering',
    ar: 'الهندسة الكهروميكانيكية',
  },
  quantitySurveying: {
    en: 'Quantity Surveying',
    ar: 'حصر الكميات',
  },
  sectors: {en: 'Sectors', ar: 'القطاعات'},
  projects: {en: 'Projects', ar: 'المشاريع'},
  services: {en: 'Services', ar: 'الخدمات'},
  team: {en: 'Team', ar: 'فريق العمل'},
  contact: {en: 'Contact', ar: 'تواصل معنا'},
  careers: {en: 'Careers', ar: 'الوظائف'},
  companyProfile: {
    en: 'Company Profile',
    ar: 'الملف التعريفي للشركة',
  },
};

/** @param {keyof typeof terminology} key @param {'en'|'ar'} locale */
export function term(key, locale = 'en') {
  const entry = terminology[key];
  if (!entry) return key;
  return locale === 'ar' ? entry.ar : entry.en;
}
