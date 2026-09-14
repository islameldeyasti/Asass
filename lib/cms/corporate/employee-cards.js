/**
 * Digital employee card — presentation layer on team member records.
 * Stable public URL uses digital_card.publicId → /c/[publicId]
 */

export const THEME_PRESETS = [
  {id: 'asas-classic', label: 'ASAS Classic', labelAr: 'أساس كلاسيك'},
  {id: 'asas-dark', label: 'ASAS Dark', labelAr: 'أساس داكن'},
  {id: 'warm-neutral', label: 'Warm Neutral', labelAr: 'محايد دافئ'},
  {id: 'high-contrast', label: 'High Contrast', labelAr: 'تباين عالٍ'},
];

export const DEFAULT_CARD_TEMPLATE = 'asas-executive';

/** Legacy template id → current id */
const TEMPLATE_ALIASES = {
  'asas-classic': 'asas-executive',
  'minimal-professional': 'minimal-signature',
  'architectural-signature': 'architectural-grid',
};

export const CARD_TEMPLATES = [
  {
    id: 'asas-executive',
    name: 'ASAS Executive',
    nameAr: 'أساس التنفيذي',
    description: 'White corporate card with strong ASAS brand header and overlapping portrait.',
    supportsCover: false,
    portraitShape: 'rounded',
    density: 'comfortable',
    printStyle: 'executive',
  },
  {
    id: 'executive-dark',
    name: 'Executive Dark',
    nameAr: 'تنفيذي داكن',
    description: 'Charcoal executive surface, white type, rust accents, large portrait.',
    supportsCover: false,
    portraitShape: 'rounded',
    density: 'comfortable',
    printStyle: 'dark',
  },
  {
    id: 'cover-profile',
    name: 'Cover Profile',
    nameAr: 'غلاف شخصي',
    description: 'Large cover image with circular overlapping portrait and centered hierarchy.',
    supportsCover: true,
    portraitShape: 'circle',
    density: 'comfortable',
    printStyle: 'cover',
  },
  {
    id: 'modern-split',
    name: 'Modern Split',
    nameAr: 'تقسيم حديث',
    description: 'Portrait / visual left, content right — strong grid, minimal corporate.',
    supportsCover: true,
    portraitShape: 'square',
    density: 'compact',
    printStyle: 'split',
  },
  {
    id: 'architectural-grid',
    name: 'Architectural Grid',
    nameAr: 'شبكة معمارية',
    description: 'Subtle technical lines and structured photo placement — engineering language.',
    supportsCover: false,
    portraitShape: 'square',
    density: 'comfortable',
    printStyle: 'grid',
  },
  {
    id: 'minimal-signature',
    name: 'Minimal Signature',
    nameAr: 'توقيع بسيط',
    description: 'Large portrait, name, role, few actions — senior management whitespace.',
    supportsCover: false,
    portraitShape: 'circle',
    density: 'airy',
    printStyle: 'minimal',
  },
  {
    id: 'brand-cover',
    name: 'Brand Cover',
    nameAr: 'غلاف العلامة',
    description: 'Branded or custom cover with overlapping circular portrait.',
    supportsCover: true,
    portraitShape: 'circle',
    density: 'comfortable',
    printStyle: 'brand',
  },
  {
    id: 'professional-id',
    name: 'Professional ID',
    nameAr: 'هوية مهنية',
    description: 'Compact credential layout with integrated QR and contact rows.',
    supportsCover: false,
    portraitShape: 'rounded',
    density: 'compact',
    printStyle: 'id',
  },
  {
    id: 'editorial-profile',
    name: 'Editorial Profile',
    nameAr: 'ملف تحريري',
    description: 'Typography-led expert profile with large editorial portrait.',
    supportsCover: true,
    portraitShape: 'editorial',
    density: 'editorial',
    printStyle: 'editorial',
  },
  {
    id: 'uae-premium',
    name: 'UAE Premium',
    nameAr: 'الإمارات الفاخر',
    description: 'Warm stone surfaces, sparse navy/rust — MD and client-facing staff.',
    supportsCover: true,
    portraitShape: 'circle',
    density: 'airy',
    printStyle: 'uae',
  },
];

export function getCardTemplate(templateId) {
  const id = resolveTemplateId(templateId);
  return CARD_TEMPLATES.find((t) => t.id === id) || CARD_TEMPLATES[0];
}

export function resolveTemplateId(templateId) {
  const raw = String(templateId || DEFAULT_CARD_TEMPLATE);
  return TEMPLATE_ALIASES[raw] || raw;
}

export function generatePublicId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export const SECTION_KEYS = ['bio', 'specialties', 'contact', 'social', 'qr'];

/** Default layout tokens (px / rem) — used by every template via CSS variables */
export const DEFAULT_CARD_LAYOUT = {
  padX: 20,
  padY: 20,
  headPadY: 18,
  gap: 8,
  sectionSpace: 12,
  actionsMargin: 18,
  radius: 22,
  nameSize: 1.45,
  titleSize: 0.95,
  bioSize: 0.88,
};

export const LAYOUT_DENSITY_PRESETS = [
  {
    id: 'default',
    label: 'Default',
    layout: {...DEFAULT_CARD_LAYOUT},
  },
  {
    id: 'compact',
    label: 'Compact',
    layout: {
      padX: 14,
      padY: 14,
      headPadY: 12,
      gap: 6,
      sectionSpace: 8,
      actionsMargin: 12,
      radius: 16,
      nameSize: 1.28,
      titleSize: 0.88,
      bioSize: 0.8,
    },
  },
  {
    id: 'comfortable',
    label: 'Comfortable',
    layout: {
      padX: 22,
      padY: 22,
      headPadY: 18,
      gap: 10,
      sectionSpace: 14,
      actionsMargin: 20,
      radius: 22,
      nameSize: 1.5,
      titleSize: 0.98,
      bioSize: 0.9,
    },
  },
  {
    id: 'airy',
    label: 'Airy',
    layout: {
      padX: 28,
      padY: 32,
      headPadY: 22,
      gap: 12,
      sectionSpace: 18,
      actionsMargin: 24,
      radius: 26,
      nameSize: 1.6,
      titleSize: 1.02,
      bioSize: 0.95,
    },
  },
];

function clampNum(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function normalizeCardLayout(raw = {}) {
  const base = DEFAULT_CARD_LAYOUT;
  const src = raw && typeof raw === 'object' ? raw : {};
  return {
    padX: clampNum(src.padX, 0, 64, base.padX),
    padY: clampNum(src.padY, 0, 72, base.padY),
    headPadY: clampNum(src.headPadY, 0, 48, base.headPadY),
    gap: clampNum(src.gap, 0, 32, base.gap),
    sectionSpace: clampNum(src.sectionSpace, 0, 48, base.sectionSpace),
    actionsMargin: clampNum(src.actionsMargin, 0, 48, base.actionsMargin),
    radius: clampNum(src.radius, 0, 40, base.radius),
    nameSize: clampNum(src.nameSize, 0.9, 2.4, base.nameSize),
    titleSize: clampNum(src.titleSize, 0.7, 1.4, base.titleSize),
    bioSize: clampNum(src.bioSize, 0.7, 1.3, base.bioSize),
  };
}

/** Inline style map for `.dcard` root — all templates inherit these. */
export function cardLayoutCssVars(layoutInput) {
  const L = normalizeCardLayout(layoutInput);
  return {
    '--dcard-pad-x': `${L.padX}px`,
    '--dcard-pad-y': `${L.padY}px`,
    '--dcard-head-pad-y': `${L.headPadY}px`,
    '--dcard-gap': `${L.gap}px`,
    '--dcard-section': `${L.sectionSpace}px`,
    '--dcard-actions-mt': `${L.actionsMargin}px`,
    '--dcard-radius': `${L.radius}px`,
    '--dcard-name-size': `${L.nameSize}rem`,
    '--dcard-title-size': `${L.titleSize}rem`,
    '--dcard-bio-size': `${L.bioSize}rem`,
  };
}

/** Brand / surface colors + cover overlay — shared by every template */
export const DEFAULT_CARD_COLORS = {
  primary: '#070463',
  accent: '#A02315',
  ink: '#14141f',
  muted: '#5b6472',
  shellBg: '#ffffff',
  headBg: '#070463',
  headText: '#ffffff',
  overlayColor: '#070463',
  overlayOpacity: 45,
};

function asHexColor(value, fallback) {
  const raw = String(value || '').trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw;
  return fallback;
}

function hexToRgba(hex, alpha) {
  let h = String(hex || '').replace('#', '');
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (h.length !== 6) return `rgba(7, 4, 99, ${alpha})`;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function normalizeCardColors(raw = {}) {
  const base = DEFAULT_CARD_COLORS;
  const src = raw && typeof raw === 'object' ? raw : {};
  return {
    primary: asHexColor(src.primary, base.primary),
    accent: asHexColor(src.accent, base.accent),
    ink: asHexColor(src.ink, base.ink),
    muted: asHexColor(src.muted, base.muted),
    shellBg: asHexColor(src.shellBg, base.shellBg),
    headBg: asHexColor(src.headBg, base.headBg),
    headText: asHexColor(src.headText, base.headText),
    overlayColor: asHexColor(src.overlayColor, base.overlayColor),
    overlayOpacity: clampNum(src.overlayOpacity, 0, 90, base.overlayOpacity),
  };
}

export function cardColorCssVars(colorsInput, coverImage = '', coverFocal = '50% 40%') {
  const C = normalizeCardColors(colorsInput);
  const hasCover = Boolean(String(coverImage || '').trim());
  const alpha = hasCover ? C.overlayOpacity / 100 : 0;
  const safeUrl = String(coverImage || '').replace(/"/g, '');
  return {
    '--dcard-navy': C.primary,
    '--dcard-rust': C.accent,
    '--dcard-ink': C.ink,
    '--dcard-muted': C.muted,
    '--dcard-shell-bg': C.shellBg,
    '--dcard-head-bg': C.headBg,
    '--dcard-head-text': C.headText,
    '--dcard-cover-image': hasCover ? `url("${safeUrl}")` : 'none',
    '--dcard-cover-focal': String(coverFocal || '50% 40%'),
    '--dcard-overlay': hexToRgba(C.overlayColor, alpha),
  };
}

/** Combined CSS variables for the shared card Shell. */
export function cardShellCssVars(card = {}) {
  return {
    ...cardLayoutCssVars(card.layout),
    ...cardColorCssVars(card.colors, card.coverImage, card.coverFocal),
  };
}

export function emptyDigitalCard(overrides = {}) {
  return {
    enabled: false,
    status: 'draft', // draft | published | disabled
    publicId: '',
    templateId: DEFAULT_CARD_TEMPLATE,
    themePreset: 'asas-classic',
    coverImage: '',
    coverFocal: '50% 40%',
    logoVariant: 'auto', // auto | light | dark
    portraitStyle: 'default', // default | circle | rounded | square
    accentStyle: 'rust',
    cardDensity: 'default',
    layout: {...DEFAULT_CARD_LAYOUT},
    colors: {...DEFAULT_CARD_COLORS},
    showBio: true,
    showDepartment: true,
    showEmail: true,
    showPhone: true,
    showMobile: false,
    showWhatsapp: false,
    showLinkedin: true,
    showLocation: false,
    showQualifications: false,
    showSpecialties: true,
    showLanguages: false,
    showQrOnCard: true,
    showSocialButtons: true,
    showContactActions: true,
    sectionsOrder: [...SECTION_KEYS],
    mobile: '',
    whatsapp: '',
    officeExtension: '',
    website: '',
    officeLocationEn: 'Abu Dhabi, UAE',
    officeLocationAr: 'أبوظبي، الإمارات',
    specialtiesEn: [],
    specialtiesAr: [],
    languagesEn: ['English', 'Arabic'],
    languagesAr: ['الإنجليزية', 'العربية'],
    views: 0,
    vcardDownloads: 0,
    contactClicks: 0,
    callClicks: 0,
    emailClicks: 0,
    whatsappClicks: 0,
    shareClicks: 0,
    ...overrides,
  };
}

function asBool(value, fallback) {
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
}

export function normalizeDigitalCard(raw = {}) {
  const base = emptyDigitalCard();
  const merged = {...base, ...(raw || {})};
  const templateId = resolveTemplateId(merged.templateId || base.templateId);

  let sectionsOrder = Array.isArray(merged.sectionsOrder)
    ? merged.sectionsOrder.filter((key) => SECTION_KEYS.includes(key))
    : [...SECTION_KEYS];
  SECTION_KEYS.forEach((key) => {
    if (!sectionsOrder.includes(key)) sectionsOrder.push(key);
  });

  return {
    ...merged,
    templateId,
    publicId: String(merged.publicId || '').trim().toUpperCase(),
    themePreset: THEME_PRESETS.some((t) => t.id === merged.themePreset)
      ? merged.themePreset
      : base.themePreset,
    coverImage: String(merged.coverImage || ''),
    coverFocal: String(merged.coverFocal || base.coverFocal),
    logoVariant: ['auto', 'light', 'dark'].includes(merged.logoVariant)
      ? merged.logoVariant
      : 'auto',
    cardDensity: ['default', 'compact', 'comfortable', 'airy', 'custom'].includes(merged.cardDensity)
      ? merged.cardDensity
      : 'default',
    layout: normalizeCardLayout(merged.layout || base.layout),
    colors: normalizeCardColors(merged.colors || base.colors),
    sectionsOrder,
    specialtiesEn: Array.isArray(merged.specialtiesEn) ? merged.specialtiesEn : base.specialtiesEn,
    specialtiesAr: Array.isArray(merged.specialtiesAr) ? merged.specialtiesAr : base.specialtiesAr,
    languagesEn: Array.isArray(merged.languagesEn) ? merged.languagesEn : base.languagesEn,
    languagesAr: Array.isArray(merged.languagesAr) ? merged.languagesAr : base.languagesAr,
    showEmail: asBool(merged.showEmail, base.showEmail),
    showPhone: asBool(merged.showPhone, base.showPhone),
    showMobile: asBool(merged.showMobile, base.showMobile),
    showWhatsapp: asBool(merged.showWhatsapp, base.showWhatsapp),
    showLinkedin: asBool(merged.showLinkedin, base.showLinkedin),
    showLocation: asBool(merged.showLocation, base.showLocation),
    showBio: asBool(merged.showBio, base.showBio),
    showQualifications: asBool(merged.showQualifications, base.showQualifications),
    showSpecialties: asBool(merged.showSpecialties, base.showSpecialties),
    showLanguages: asBool(merged.showLanguages, base.showLanguages),
    showDepartment: asBool(merged.showDepartment, base.showDepartment),
    showQrOnCard: asBool(merged.showQrOnCard, base.showQrOnCard),
    showSocialButtons: asBool(merged.showSocialButtons, base.showSocialButtons),
    showContactActions: asBool(merged.showContactActions, base.showContactActions),
    views: Number(merged.views) || 0,
    vcardDownloads: Number(merged.vcardDownloads) || 0,
    contactClicks: Number(merged.contactClicks) || 0,
    callClicks: Number(merged.callClicks) || 0,
    emailClicks: Number(merged.emailClicks) || 0,
    whatsappClicks: Number(merged.whatsappClicks) || 0,
    shareClicks: Number(merged.shareClicks) || 0,
    status: ['draft', 'published', 'disabled'].includes(merged.status)
      ? merged.status
      : 'draft',
  };
}

/** Ensure card has a unique-looking publicId (caller should still check collisions). */
export function ensureCardPublicId(card) {
  const next = normalizeDigitalCard(card);
  if (next.publicId && /^[A-Z0-9]{6,12}$/.test(next.publicId)) return next;
  return {...next, publicId: generatePublicId()};
}

export function buildPublicCardPath(publicId) {
  return `/c/${encodeURIComponent(String(publicId || '').trim().toUpperCase())}`;
}

export function buildVCard(member, card, company, {profileUrl} = {}) {
  const c = normalizeDigitalCard(card);
  const lines = ['BEGIN:VCARD', 'VERSION:4.0'];
  const name = member.name_en || member.name_ar || '';
  const nameAr = member.name_ar || '';
  lines.push(`FN:${escapeV(name)}`);
  lines.push(`N:${escapeV(name)};;;;`);
  if (nameAr) lines.push(`NICKNAME:${escapeV(nameAr)}`);
  if (member.job_title_en) lines.push(`TITLE:${escapeV(member.job_title_en)}`);
  if (company?.name) lines.push(`ORG:${escapeV(company.name)}`);
  if (c.showEmail && member.email) lines.push(`EMAIL;TYPE=work:${escapeV(member.email)}`);
  if (c.showPhone && member.phone) lines.push(`TEL;TYPE=work,voice:${escapeV(member.phone)}`);
  if (c.showMobile && c.mobile) lines.push(`TEL;TYPE=cell,voice:${escapeV(c.mobile)}`);
  if (c.website) lines.push(`URL:${escapeV(c.website)}`);
  else if (c.showLinkedin && member.linkedin_url) lines.push(`URL:${escapeV(member.linkedin_url)}`);
  if (profileUrl) lines.push(`URL;TYPE=profile:${escapeV(profileUrl)}`);
  if (c.showLocation && (c.officeLocationEn || company?.address)) {
    const adr = c.officeLocationEn || company.address;
    lines.push(`ADR;TYPE=work:;;${escapeV(adr)};;;;`);
  } else if (company?.address) {
    lines.push(`ADR;TYPE=work:;;${escapeV(company.address)};;;;`);
  }
  lines.push('END:VCARD');
  return `${lines.join('\r\n')}\r\n`;
}

function escapeV(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

/** Copy design-only settings from source card onto target (no PII). */
export function copyCardDesign(sourceCard = {}, targetCard = {}) {
  const source = normalizeDigitalCard(sourceCard);
  const target = normalizeDigitalCard(targetCard);
  return normalizeDigitalCard({
    ...target,
    templateId: source.templateId,
    themePreset: source.themePreset,
    coverImage: source.coverImage,
    coverFocal: source.coverFocal,
    logoVariant: source.logoVariant,
    portraitStyle: source.portraitStyle,
    accentStyle: source.accentStyle,
    cardDensity: source.cardDensity,
    layout: source.layout,
    colors: source.colors,
    showBio: source.showBio,
    showDepartment: source.showDepartment,
    showEmail: source.showEmail,
    showPhone: source.showPhone,
    showMobile: source.showMobile,
    showWhatsapp: source.showWhatsapp,
    showLinkedin: source.showLinkedin,
    showLocation: source.showLocation,
    showQualifications: source.showQualifications,
    showSpecialties: source.showSpecialties,
    showLanguages: source.showLanguages,
    showQrOnCard: source.showQrOnCard,
    showSocialButtons: source.showSocialButtons,
    showContactActions: source.showContactActions,
    sectionsOrder: source.sectionsOrder,
  });
}
