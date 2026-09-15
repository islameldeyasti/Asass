'use client';

import {normalizeDigitalCard, getCardTemplate} from '@/lib/cms/corporate/employee-cards';

export function pickLocale(ar, enValue, arValue) {
  return ar ? arValue || enValue : enValue;
}

export function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

export function initialsFromName(name = '') {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

/**
 * Unified view-model consumed by all 10 templates.
 */
export function buildCardViewModel({
  member,
  card: rawCard,
  company,
  branding,
  locale = 'en',
  qrDataUrl = '',
  profileUrl = '',
}) {
  const ar = locale === 'ar';
  const card = normalizeDigitalCard(rawCard);
  const template = getCardTemplate(card.templateId);
  const name = pickLocale(ar, member?.name_en, member?.name_ar);
  const title = pickLocale(ar, member?.job_title_en, member?.job_title_ar);
  const department = pickLocale(ar, member?.department_en, member?.department_ar);
  const bio = pickLocale(ar, member?.short_bio_en, member?.short_bio_ar);
  const location = pickLocale(ar, card.officeLocationEn, card.officeLocationAr);
  const companyName = pickLocale(ar, company?.name, company?.nameAr) || 'ASAS Engineering';
  const specialties = pickLocale(ar, card.specialtiesEn, card.specialtiesAr) || [];
  const languages = pickLocale(ar, card.languagesEn, card.languagesAr) || [];
  const qualifications = pickLocale(ar, member?.qualifications_en, member?.qualifications_ar) || [];

  const lightLogo = branding?.lightLogo || branding?.primaryLogo || '/brand/asas-logo-light.png';
  const darkLogo = branding?.darkLogo || '/brand/asas-logo-dark.png';
  let logoSrc = lightLogo;
  if (card.logoVariant === 'dark') logoSrc = darkLogo;
  else if (card.logoVariant === 'light') logoSrc = lightLogo;

  const phone = card.showPhone ? member?.phone : '';
  const email = card.showEmail ? member?.email : '';
  const mobile = card.showMobile ? card.mobile || '' : '';
  const whatsappRaw = card.showWhatsapp ? card.whatsapp || card.mobile || member?.phone : '';
  const whatsapp = digitsOnly(whatsappRaw);
  const linkedin = card.showLinkedin ? member?.linkedin_url : '';
  const website = card.website || (company?.website ? `https://${company.website}` : '');

  return {
    ar,
    locale,
    card,
    template,
    templateId: template.id,
    name,
    title,
    department,
    bio,
    location: card.showLocation ? location : '',
    companyName,
    companyShort: company?.shortName || 'ASAS',
    companyCity: company?.city || 'Abu Dhabi',
    specialties: card.showSpecialties ? specialties : [],
    languages: card.showLanguages ? languages : [],
    qualifications: card.showQualifications ? qualifications : [],
    photo: member?.profile_image || '',
    photoFocal: member?.profile_image_focal || '50% 30%',
    coverImage: card.coverImage || '',
    coverFocal: card.coverFocal || '50% 40%',
    initials: initialsFromName(name) || 'A',
    lightLogo,
    darkLogo,
    logoSrc,
    phone,
    email,
    mobile,
    whatsapp,
    linkedin,
    website,
    officeExtension: card.officeExtension || '',
    qrDataUrl,
    profileUrl,
    showBio: card.showBio && Boolean(bio),
    showDepartment: card.showDepartment && Boolean(department),
    showQrOnCard: card.showQrOnCard && Boolean(qrDataUrl),
    showContactActions: card.showContactActions !== false,
    showSocialButtons: card.showSocialButtons !== false,
    showCompanyResources: card.showCompanyResources !== false,
    themePreset: card.themePreset || 'asas-classic',
    sectionsOrder: card.sectionsOrder || [],
  };
}
