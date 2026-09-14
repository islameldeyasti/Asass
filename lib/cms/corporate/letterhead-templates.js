/**
 * Letterhead template design tokens — presentation only.
 * Changing template must never alter document content fields.
 */

export const LETTERHEAD_TEMPLATES = [
  {
    id: 'classic-executive',
    name: 'ASAS Official',
    nameAr: 'أساس الرسمي',
    description: 'Official ASAS letterhead — navy/rust geometric bars from brand PDF.',
  },
  {
    id: 'blank-canvas',
    name: 'Blank',
    nameAr: 'فارغ',
    description: 'Empty A4 — upload logos and draw your own shapes, bars, and lines.',
  },
];

/** Fixed A4 geometry + per-template chrome heights (mm). */
export const LETTERHEAD_LAYOUT = {
  pageWidthMm: 210,
  pageHeightMm: 297,
  pageGapMm: 10,
};

/**
 * @typedef {object} TemplateTokens
 * @property {string} headerHeight
 * @property {string} footerHeight
 * @property {string} pagePaddingInline
 * @property {string} bodyPaddingTop
 * @property {string} bodyPaddingBottom
 * @property {string} logoHeight
 * @property {'start'|'center'|'between'} headerAlignment
 * @property {'line'|'double'|'band'|'none'} dividerStyle
 * @property {'split'|'stacked'|'minimal'} footerLayout
 * @property {string} accent
 */

/** @type {Record<string, TemplateTokens>} */
export const TEMPLATE_TOKENS = {
  'classic-executive': {
    headerHeight: '62mm',
    footerHeight: '42mm',
    pagePaddingInline: '16mm',
    bodyPaddingTop: '2mm',
    bodyPaddingBottom: '2mm',
    logoHeight: '22mm',
    headerAlignment: 'between',
    dividerStyle: 'none',
    footerLayout: 'official',
    accent: '#A02315',
  },
  'blank-canvas': {
    headerHeight: '10mm',
    footerHeight: '12mm',
    pagePaddingInline: '18mm',
    bodyPaddingTop: '4mm',
    bodyPaddingBottom: '4mm',
    logoHeight: '16mm',
    headerAlignment: 'start',
    dividerStyle: 'none',
    footerLayout: 'minimal',
    accent: '#070463',
  },
  'modern-architectural': {
    headerHeight: '38mm',
    footerHeight: '22mm',
    pagePaddingInline: '16mm',
    bodyPaddingTop: '8mm',
    bodyPaddingBottom: '2mm',
    logoHeight: '12mm',
    headerAlignment: 'between',
    dividerStyle: 'none',
    footerLayout: 'split',
    accent: '#A02315',
  },
  'minimal-corporate': {
    headerHeight: '42mm',
    footerHeight: '20mm',
    pagePaddingInline: '20mm',
    bodyPaddingTop: '4mm',
    bodyPaddingBottom: '2mm',
    logoHeight: '16mm',
    headerAlignment: 'center',
    dividerStyle: 'line',
    footerLayout: 'minimal',
    accent: '#070463',
  },
  'signature-brand': {
    headerHeight: '36mm',
    footerHeight: '20mm',
    pagePaddingInline: '16mm',
    bodyPaddingTop: '4mm',
    bodyPaddingBottom: '2mm',
    logoHeight: '14mm',
    headerAlignment: 'between',
    dividerStyle: 'band',
    footerLayout: 'split',
    accent: '#A02315',
  },
  'premium-uae': {
    headerHeight: '40mm',
    footerHeight: '22mm',
    pagePaddingInline: '18mm',
    bodyPaddingTop: '4mm',
    bodyPaddingBottom: '2mm',
    logoHeight: '14mm',
    headerAlignment: 'start',
    dividerStyle: 'line',
    footerLayout: 'stacked',
    accent: '#070463',
  },
};

export function getTemplateTokens(templateId) {
  return (
    TEMPLATE_TOKENS[templateId] || TEMPLATE_TOKENS['classic-executive']
  );
}

/** Body height in mm for a given template (printable flow area). */
export function getBodyHeightMm(templateId) {
  const t = getTemplateTokens(templateId);
  const header = parseFloat(t.headerHeight);
  const footer = parseFloat(t.footerHeight);
  return LETTERHEAD_LAYOUT.pageHeightMm - header - footer;
}

export const OFFICIAL_LETTERHEAD_PAGE_BG =
  '/assets/asas/corporate/asas-letterhead-page-bg.png';

/** Element positions (mm) for official header logo + footer blocks */
export const DEFAULT_LETTERHEAD_CHROME_LAYOUT = {
  logoLeft: 12,
  logoTop: 40,
  logoPad: 0,
  addrLeft: 10,
  addrBottom: 6.5,
  emailGap: 8,
  phonesRight: 10,
  phonesBottom: 4,
  ctaRight: 10,
  ctaBottom: 17.5,
  qrRight: 11,
  qrBottom: 48,
  qrSize: 22,
};

function clampMm(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function normalizeLetterheadChromeLayout(raw = {}) {
  const base = DEFAULT_LETTERHEAD_CHROME_LAYOUT;
  const src = raw && typeof raw === 'object' ? raw : {};
  let qrBottom = clampMm(src.qrBottom, 0, 90, base.qrBottom);
  let qrSize = clampMm(src.qrSize, 12, 36, base.qrSize);
  // Keep full QR above footer bars (was clipped when bottom ≤ ~27mm)
  const minClearance = qrSize + 24;
  if (qrBottom < minClearance) {
    qrBottom = minClearance;
  }
  return {
    logoLeft: clampMm(src.logoLeft, 0, 160, base.logoLeft),
    logoTop: clampMm(src.logoTop, 0, 80, base.logoTop),
    logoPad: clampMm(src.logoPad, 0, 12, base.logoPad),
    addrLeft: clampMm(src.addrLeft, 0, 120, base.addrLeft),
    addrBottom: clampMm(src.addrBottom, 0, 40, base.addrBottom),
    emailGap: clampMm(src.emailGap, 0, 24, base.emailGap),
    phonesRight: clampMm(src.phonesRight, 0, 80, base.phonesRight),
    phonesBottom: clampMm(src.phonesBottom, 0, 30, base.phonesBottom),
    ctaRight: clampMm(src.ctaRight, 0, 80, base.ctaRight),
    ctaBottom: clampMm(src.ctaBottom, 0, 40, base.ctaBottom),
    qrRight: clampMm(src.qrRight, 0, 80, base.qrRight),
    qrBottom,
    qrSize,
  };
}

export function letterheadChromeCssVars(layoutInput) {
  const L = normalizeLetterheadChromeLayout(layoutInput);
  return {
    '--lh-logo-left': `${L.logoLeft}mm`,
    '--lh-logo-top': `${L.logoTop}mm`,
    '--lh-logo-pad': `${L.logoPad}mm`,
    '--lh-addr-left': `${L.addrLeft}mm`,
    '--lh-addr-bottom': `${L.addrBottom}mm`,
    '--lh-email-gap': `${L.emailGap}mm`,
    '--lh-phones-right': `${L.phonesRight}mm`,
    '--lh-phones-bottom': `${L.phonesBottom}mm`,
    '--lh-cta-right': `${L.ctaRight}mm`,
    '--lh-cta-bottom': `${L.ctaBottom}mm`,
    '--lh-qr-right': `${L.qrRight}mm`,
    '--lh-qr-bottom': `${L.qrBottom}mm`,
    '--lh-qr-size': `${L.qrSize}mm`,
  };
}

const LAYER_TYPES = new Set(['rect', 'bar', 'line', 'logo']);

function newLayerId() {
  return `ly_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createDesignLayer(type = 'rect', overrides = {}) {
  const base = {
    rect: {type: 'rect', x: 16, y: 20, w: 40, h: 12, color: '#070463', opacity: 1},
    bar: {type: 'bar', x: 0, y: 0, w: 90, h: 8, color: '#A02315', opacity: 1},
    line: {type: 'line', x: 16, y: 40, w: 80, h: 0.6, color: '#070463', opacity: 1},
    logo: {type: 'logo', x: 16, y: 18, w: 36, h: 18, color: '#070463', opacity: 1, src: ''},
  }[type] || {type: 'rect', x: 16, y: 20, w: 40, h: 12, color: '#070463', opacity: 1};

  return {
    id: newLayerId(),
    ...base,
    ...overrides,
    type: LAYER_TYPES.has(overrides.type || type) ? overrides.type || type : 'rect',
  };
}

export function normalizeDesignLayers(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const type = LAYER_TYPES.has(item.type) ? item.type : 'rect';
      return {
        id: String(item.id || `ly_${index}`),
        type,
        x: clampMm(item.x, -20, 220, 16),
        y: clampMm(item.y, -20, 310, 20),
        w: clampMm(item.w, 0.4, 220, type === 'line' ? 60 : 30),
        h: clampMm(item.h, 0.3, 297, type === 'line' ? 0.6 : 10),
        color: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(item.color || ''))
          ? String(item.color)
          : '#070463',
        opacity: clampMm(item.opacity, 0.05, 1, 1),
        src: String(item.src || ''),
        z: Number.isFinite(Number(item.z)) ? Number(item.z) : index,
      };
    })
    .filter(Boolean);
}

export function emptyLetterhead(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: '',
    title: 'Untitled letter',
    templateId: 'classic-executive',
    language: 'en',
    status: 'draft',
    date: now.slice(0, 10),
    reference: '',
    subject: '',
    recipientName: '',
    recipientCompany: '',
    recipientAddress: '',
    bodyHtml: '<p></p>',
    closing: 'Yours sincerely,',
    signatoryName: '',
    signatoryTitle: '',
    signatureImage: '',
    stampImage: '',
    // Page chrome
    showFooter: true,
    showPageNumbers: true,
    showCompanyName: true,
    showHeaderAddress: true,
    showHeaderDivider: false,
    footerDetail: 'full',
    confidential: false,
    logoScale: 'md',
    // Official PDF letterhead controls
    showGeoBars: true,
    showWatermark: true,
    showQr: true,
    showMark: true,
    showWordmark: true,
    showTagline: true,
    showFooterAddress: true,
    showFooterEmail: true,
    showFooterPhones: true,
    showFooterWebsite: true,
    headerMarkUrl: '',
    qrImageUrl: '',
    // Full-page A4 artwork (geometric bars baked into image)
    backgroundImageUrl: OFFICIAL_LETTERHEAD_PAGE_BG,
    chromeLayout: {...DEFAULT_LETTERHEAD_CHROME_LAYOUT},
    designLayers: [],
    footerAddressLine1: '',
    footerAddressLine2: '',
    footerEmail: '',
    footerPhone: '',
    footerMobile: '',
    footerPoBox: '',
    footerWebsite: '',
    footerCtaLabel: '',
    createdAt: now,
    updatedAt: now,
    createdBy: '',
    ...overrides,
    chromeLayout: normalizeLetterheadChromeLayout(
      overrides.chromeLayout || DEFAULT_LETTERHEAD_CHROME_LAYOUT,
    ),
    designLayers: normalizeDesignLayers(overrides.designLayers),
  };
}

export function resolveLetterLanguage(doc) {
  if (!doc) return {language: 'en', dir: 'ltr'};
  const hasArabicScript = /[\u0600-\u06FF]/.test(
    `${doc.bodyHtml || ''} ${doc.subject || ''} ${doc.recipientName || ''}`,
  );
  let language = 'en';
  if (doc.language === 'ar') language = 'ar';
  else if (doc.language === 'bilingual') {
    language = hasArabicScript ? 'ar' : 'en';
  }
  return {language, dir: language === 'ar' ? 'rtl' : 'ltr'};
}
