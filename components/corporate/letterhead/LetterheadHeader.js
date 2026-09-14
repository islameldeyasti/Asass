'use client';

import {getTemplateTokens, letterheadChromeCssVars} from '@/lib/cms/corporate/letterhead-templates';

const LOCKUP_SRC = '/assets/asas/corporate/asas-letterhead-lockup.png';
const MARK_SRC = '/assets/asas/corporate/asas-letterhead-mark.png';
const BARS_SRC = '/assets/asas/corporate/asas-letterhead-header-bars.png';

/**
 * Letterhead header — Official PDF chrome OR alternate template layouts.
 */
export default function LetterheadHeader({
  doc,
  company,
  logoUrl = MARK_SRC,
  language = 'en',
}) {
  const templateId = doc?.templateId || 'classic-executive';
  const tokens = getTemplateTokens(templateId);
  const isOfficial = templateId === 'classic-executive';
  const isBlank = templateId === 'blank-canvas';
  const tagline =
    language === 'ar'
      ? 'للاستشارات الهندسية وإدارة المشاريع'
      : 'Engineering & Projects\nManagement Consultancy';
  const companyName =
    language === 'ar'
      ? company?.nameAr || company?.name || 'ASAS'
      : company?.name || 'ASAS Engineering & Projects Management Consultancy';
  const place =
    language === 'ar' ? 'أبوظبي، الإمارات' : 'Abu Dhabi, United Arab Emirates';
  const scale =
    doc?.logoScale === 'sm' ? 0.88 : doc?.logoScale === 'lg' ? 1.18 : 1;
  const customMark = doc?.headerMarkUrl || '';
  const markSrc = customMark || logoUrl || MARK_SRC;
  const hasPageBg = Boolean(String(doc?.backgroundImageUrl || '').trim());
  // Page background already includes geometric bars — don't double-draw CSS/PNG bars.
  const showGeo = !hasPageBg && doc?.showGeoBars !== false;
  const showWordmark =
    doc?.showWordmark !== false && doc?.showCompanyName !== false;
  const showTagline = doc?.showTagline !== false;
  const showMark = doc?.showMark !== false;
  const usePdfLockup =
    isOfficial && !customMark && showWordmark && showTagline && showMark;
  const chromeStyle = {
    '--lh-logo-scale': scale,
    ...letterheadChromeCssVars(doc?.chromeLayout),
  };

  if (isBlank) {
    return (
      <header
        className="lh-zone-header lh-header-blank"
        aria-label="Letterhead header"
      >
        {doc?.confidential ? (
          <div className="lh-confidential-mark">
            {language === 'ar' ? 'سري' : 'CONFIDENTIAL'}
          </div>
        ) : null}
      </header>
    );
  }

  if (isOfficial) {
    return (
      <header
        className="lh-zone-header lh-header-official lh-tpl-chrome-classic-executive"
        aria-label="Letterhead header"
        style={chromeStyle}
      >
        {showGeo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="lh-geo-bars-img" src={BARS_SRC} alt="" aria-hidden />
        ) : null}

        <div className="lh-official-brand">
          {usePdfLockup ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="lh-official-lockup"
              src={LOCKUP_SRC}
              alt={company?.name || 'ASAS'}
            />
          ) : (
            <>
              {showWordmark || showTagline ? (
                <div className="lh-official-wordmark">
                  {showWordmark ? <p className="lh-asas-title">ASAS</p> : null}
                  {showTagline ? (
                    <p className="lh-asas-tagline">{tagline}</p>
                  ) : null}
                </div>
              ) : null}
              {showMark ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="lh-official-mark" src={markSrc} alt="ASAS" />
              ) : null}
            </>
          )}
        </div>

        {doc?.confidential ? (
          <div className="lh-confidential-mark">
            {language === 'ar' ? 'سري' : 'CONFIDENTIAL'}
          </div>
        ) : null}
        <span className="lh-sr-only">{tokens.headerHeight}</span>
      </header>
    );
  }

  const align =
    tokens.headerAlignment === 'center'
      ? 'is-centered'
      : tokens.headerAlignment === 'between'
        ? 'is-between'
        : 'is-start';

  return (
    <header
      className={`lh-zone-header lh-header-alt lh-tpl-chrome-${templateId}`}
      aria-label="Letterhead header"
      style={{'--lh-logo-scale': scale}}
    >
      {templateId === 'premium-uae' ? (
        <span className="lh-side-rail" aria-hidden />
      ) : null}
      {templateId === 'modern-architectural' ? (
        <span className="lh-modern-band" aria-hidden />
      ) : null}

      <div className={`lh-header-inner ${align}`}>
        {showMark ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="lh-header-logo"
            src={markSrc}
            alt=""
            style={{height: `calc(var(--lh-logo-h) * ${scale})`}}
          />
        ) : null}
        {showWordmark || showTagline ? (
          <div className="lh-header-meta">
            {showWordmark ? (
              <p className="lh-header-company">{companyName}</p>
            ) : null}
            {showTagline ? (
              <p className="lh-header-place">{place}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {tokens.dividerStyle !== 'none' || templateId === 'signature-brand' ? (
        <div
          className={`lh-header-rule lh-divider-${templateId === 'signature-brand' ? 'band' : tokens.dividerStyle || 'line'}`}
        />
      ) : null}
      {templateId === 'minimal-corporate' ? (
        <div className="lh-header-rule lh-divider-line lh-rule-center" />
      ) : null}
      {templateId === 'modern-architectural' ? (
        <span className="lh-modern-accent" aria-hidden />
      ) : null}

      {doc?.confidential ? (
        <div className="lh-confidential-mark">
          {language === 'ar' ? 'سري' : 'CONFIDENTIAL'}
        </div>
      ) : null}
    </header>
  );
}
