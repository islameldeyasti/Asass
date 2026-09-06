/**
 * Team content model — bilingual fields, optional relations.
 * Public pages only expose published members.
 */

export const TEAM_STATUSES = ['draft', 'published'];

export const teamDepartments = [
  {id: 'leadership', label: 'Leadership', labelAr: 'القيادة'},
  {id: 'architecture', label: 'Architecture', labelAr: 'العمارة'},
  {id: 'structural', label: 'Structural', labelAr: 'الإنشاءات'},
  {id: 'mep', label: 'MEP', labelAr: 'MEP'},
  {id: 'project-management', label: 'Project Management', labelAr: 'إدارة المشاريع'},
  {id: 'supervision', label: 'Supervision', labelAr: 'الإشراف'},
  {id: 'administration', label: 'Administration', labelAr: 'الإدارة'},
];

export function emptyTeamMember(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: '',
    slug: '',
    name_en: '',
    name_ar: '',
    job_title_en: '',
    job_title_ar: '',
    department_en: '',
    department_ar: '',
    department_id: '',
    short_bio_en: '',
    short_bio_ar: '',
    full_bio_en: '',
    full_bio_ar: '',
    profile_image: '',
    profile_image_focal: '50% 30%',
    secondary_image: '',
    email: '',
    phone: '',
    linkedin_url: '',
    social_links: [],
    years_experience: '',
    nationality: '',
    education_en: [],
    education_ar: [],
    qualifications_en: [],
    qualifications_ar: [],
    certifications_en: [],
    certifications_ar: [],
    expertise_en: [],
    expertise_ar: [],
    notable_projects: [],
    quote_en: '',
    quote_ar: '',
    featured: false,
    leadership: false,
    display_order: 100,
    status: 'draft',
    seo_title_en: '',
    seo_title_ar: '',
    seo_description_en: '',
    seo_description_ar: '',
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function asString(value) {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function asBool(value) {
  return value === true || value === 'true' || value === '1' || value === 1;
}

function asList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function asSocial(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      label: asString(item?.label),
      url: asString(item?.url),
    }))
    .filter((item) => item.label && item.url);
}

export function normalizeTeamMember(input = {}, {generateId = false} = {}) {
  const base = emptyTeamMember();
  const now = new Date().toISOString();
  const nameEn = asString(input.name_en || input.name);
  const slugSource = asString(input.slug) || nameEn;
  const id = asString(input.id) || (generateId ? `tm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}` : '');

  const dept = teamDepartments.find(
    (item) => item.id === input.department_id || item.label === input.department_en,
  );

  return {
    ...base,
    ...input,
    id,
    slug: slugify(slugSource),
    name_en: nameEn,
    name_ar: asString(input.name_ar),
    job_title_en: asString(input.job_title_en || input.job_title),
    job_title_ar: asString(input.job_title_ar),
    department_id: asString(input.department_id || dept?.id),
    department_en: asString(input.department_en || dept?.label),
    department_ar: asString(input.department_ar || dept?.labelAr),
    short_bio_en: asString(input.short_bio_en || input.short_bio),
    short_bio_ar: asString(input.short_bio_ar),
    full_bio_en: asString(input.full_bio_en || input.full_bio),
    full_bio_ar: asString(input.full_bio_ar),
    profile_image: asString(input.profile_image),
    profile_image_focal: asString(input.profile_image_focal) || '50% 30%',
    secondary_image: asString(input.secondary_image),
    email: asString(input.email),
    phone: asString(input.phone),
    linkedin_url: asString(input.linkedin_url),
    social_links: asSocial(input.social_links),
    years_experience: asString(input.years_experience),
    nationality: asString(input.nationality),
    education_en: asList(input.education_en),
    education_ar: asList(input.education_ar),
    qualifications_en: asList(input.qualifications_en),
    qualifications_ar: asList(input.qualifications_ar),
    certifications_en: asList(input.certifications_en),
    certifications_ar: asList(input.certifications_ar),
    expertise_en: asList(input.expertise_en),
    expertise_ar: asList(input.expertise_ar),
    notable_projects: asList(input.notable_projects),
    quote_en: asString(input.quote_en),
    quote_ar: asString(input.quote_ar),
    featured: asBool(input.featured),
    leadership: asBool(input.leadership),
    display_order: Number.isFinite(Number(input.display_order)) ? Number(input.display_order) : 100,
    status: TEAM_STATUSES.includes(input.status) ? input.status : 'draft',
    seo_title_en: asString(input.seo_title_en),
    seo_title_ar: asString(input.seo_title_ar),
    seo_description_en: asString(input.seo_description_en),
    seo_description_ar: asString(input.seo_description_ar),
    created_at: asString(input.created_at) || now,
    updated_at: now,
  };
}

export function validateTeamMember(member) {
  const errors = [];
  if (!member.name_en) errors.push('name_en is required');
  if (!member.slug) errors.push('slug is required');
  if (!member.job_title_en) errors.push('job_title_en is required');
  if (!TEAM_STATUSES.includes(member.status)) errors.push('invalid status');
  return errors;
}

export function sortTeamMembers(members) {
  return [...members].sort((a, b) => {
    const orderA = Number(a.display_order) || 100;
    const orderB = Number(b.display_order) || 100;
    if (orderA !== orderB) return orderA - orderB;
    const rank = (m) => (m.leadership ? 0 : m.featured ? 1 : 2);
    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) return rankDiff;
    return String(a.name_en || '').localeCompare(String(b.name_en || ''));
  });
}

export function getActiveTeamFilters(members) {
  const filters = [{id: 'all', label: 'All', labelAr: 'الكل'}];
  if (members.some((member) => member.leadership)) {
    filters.push({id: 'leadership', label: 'Leadership', labelAr: 'القيادة'});
  }
  teamDepartments.forEach((dept) => {
    if (dept.id === 'leadership') return;
    if (members.some((member) => member.department_id === dept.id)) {
      filters.push(dept);
    }
  });
  return filters;
}

export function localizeMember(member, locale = 'en') {
  const ar = locale === 'ar';
  return {
    ...member,
    name: ar ? member.name_ar || member.name_en : member.name_en,
    jobTitle: ar ? member.job_title_ar || member.job_title_en : member.job_title_en,
    department: ar ? member.department_ar || member.department_en : member.department_en,
    shortBio: ar ? member.short_bio_ar || member.short_bio_en : member.short_bio_en,
    fullBio: ar ? member.full_bio_ar || member.full_bio_en : member.full_bio_en,
    quote: ar ? member.quote_ar || member.quote_en : member.quote_en,
    expertise: ar ? (member.expertise_ar?.length ? member.expertise_ar : member.expertise_en) : member.expertise_en,
    education: ar ? (member.education_ar?.length ? member.education_ar : member.education_en) : member.education_en,
    qualifications: ar
      ? member.qualifications_ar?.length
        ? member.qualifications_ar
        : member.qualifications_en
      : member.qualifications_en,
    certifications: ar
      ? member.certifications_ar?.length
        ? member.certifications_ar
        : member.certifications_en
      : member.certifications_en,
    seoTitle: ar ? member.seo_title_ar || member.seo_title_en : member.seo_title_en,
    seoDescription: ar ? member.seo_description_ar || member.seo_description_en : member.seo_description_en,
  };
}
