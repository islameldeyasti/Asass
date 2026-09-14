'use client';

import {letterheadChromeCssVars} from '@/lib/cms/corporate/letterhead-templates';

const DEFAULT_QR = '/assets/asas/corporate/asas-letterhead-qr-default.png';

/**
 * Letterhead footer — Official PDF geometry OR simpler alternate templates.
 */
export default function LetterheadFooter({
  doc,
  company,
  language = 'en',
  pageNumber = 1,
  totalPages = 1,
  qrDataUrl = '',
}) {
  const templateId = doc?.templateId || 'classic-executive';
  const isOfficial = templateId === 'classic-executive';
  const isBlank = templateId === 'blank-canvas';
  const chromeStyle = letterheadChromeCssVars(doc?.chromeLayout);

  if (doc?.showFooter === false && doc?.showPageNumbers === false) {
    return (
      <footer
        className={`lh-zone-footer ${isBlank ? 'lh-footer-blank' : isOfficial ? 'lh-footer-official' : 'lh-footer-alt'} lh-footer-empty`}
        aria-hidden
      />
    );
  }

  const phone = doc?.footerPhone || company?.phone || '+971 2 63 11 320';
  const mobile = doc?.footerMobile || company?.mobile || '+971 55 410 5649';
  const email = doc?.footerEmail || company?.email || 'asas@asasengg.ae';
  const website = doc?.footerWebsite || company?.website || 'www.asasengg.ae';
  const websiteDisplay = String(website)
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
  const poBoxRaw =
    doc?.footerPoBox ||
    (language === 'ar'
      ? company?.poBoxAr || 'ص.ب. 114789'
      : company?.poBox || 'P.O. Box 114789');
  const poBox = /po\s*box|ص\.?\s*ب/i.test(poBoxRaw)
    ? poBoxRaw
    : language === 'ar'
      ? `ص.ب. ${poBoxRaw}`
      : `Po Box : ${poBoxRaw}`;

  const line1 =
    doc?.footerAddressLine1 ||
    (language === 'ar'
      ? 'مصفح شرق 9 — خلف سفير مول'
      : 'East 9 - Behind Safeer Mall');
  const line2 =
    doc?.footerAddressLine2 ||
    (language === 'ar'
      ? 'مصفح السكني، أبوظبي'
      : 'Mussafah Residential, Abu Dhabi');

  const showAddr = doc?.showFooterAddress !== false;
  const showEmail = doc?.showFooterEmail !== false;
  const showPhones = doc?.showFooterPhones !== false;
  const showWebsite = doc?.showFooterWebsite !== false;
  const hasPageBg = Boolean(String(doc?.backgroundImageUrl || '').trim());
  const ctaLabel =
    String(doc?.footerCtaLabel || '').trim() ||
    (language === 'ar' ? 'المزيد على' : 'Find out more at');

  const customQr = String(doc?.qrImageUrl || '').trim();
  const qrSrc = customQr || qrDataUrl || DEFAULT_QR;
  const showQr = doc?.showQr !== false && Boolean(qrSrc) && isOfficial;
  const showPages = doc?.showPageNumbers !== false;
  const pageLabel = `${pageNumber} / ${totalPages}`;

  if (isBlank) {
    return (
      <footer
        className={`lh-zone-footer lh-footer-blank${showPages ? '' : ' lh-footer-empty'}`}
        aria-label={showPages ? 'Letterhead footer' : undefined}
        aria-hidden={showPages ? undefined : true}
      >
        {showPages ? <p className="lh-footer-page-blank">{pageLabel}</p> : null}
      </footer>
    );
  }

  if (doc?.showFooter === false) {
    return (
      <footer
        className={`lh-zone-footer ${isOfficial ? 'lh-footer-official' : 'lh-footer-alt'} is-minimal`}
        aria-label="Letterhead footer"
        style={chromeStyle}
      >
        {showPages ? (
          <p className="lh-footer-page-official is-dark">{pageLabel}</p>
        ) : null}
      </footer>
    );
  }

  if (isOfficial) {
    return (
      <footer
        className={`lh-zone-footer lh-footer-official${hasPageBg ? ' has-page-bg' : ''}`}
        aria-label="Letterhead footer"
        style={chromeStyle}
      >
        {!hasPageBg ? (
          <div className="lh-foot-shapes" aria-hidden>
            <span className="lh-foot-upper-navy" />
            <span className="lh-foot-rust-cta" />
            <span className="lh-foot-lower-navy" />
            <span className="lh-foot-rust-tip" />
          </div>
        ) : null}

        {showQr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="lh-footer-qr" src={qrSrc} alt="QR code" />
        ) : null}

        {showWebsite ? (
          <div className="lh-footer-cta">
            <p className="lh-footer-more">{ctaLabel}</p>
            {websiteDisplay ? (
              <p className="lh-footer-website lh-footer-ltr" dir="ltr">
                {websiteDisplay}
              </p>
            ) : null}
          </div>
        ) : null}

        {(showAddr || showEmail) && (
          <div className="lh-footer-info">
            {showAddr ? (
              <div className="lh-footer-addr">
                <p>{line1}</p>
                <p>{line2}</p>
              </div>
            ) : (
              <span />
            )}
            {showEmail ? (
              <div className="lh-footer-mail">
                <p>
                  <span className="lh-footer-ltr" dir="ltr">
                    E-mail : {email}
                  </span>
                </p>
                <p>
                  <span className="lh-footer-ltr" dir="ltr">
                    {poBox}
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        )}

        {showPhones ? (
          <div className="lh-footer-phones">
            <p className="lh-footer-ltr" dir="ltr">
              {phone}
            </p>
            <p className="lh-footer-ltr" dir="ltr">
              {mobile}
            </p>
          </div>
        ) : null}

        {showPages ? (
          <p className="lh-footer-page-official is-dark">{pageLabel}</p>
        ) : null}
      </footer>
    );
  }

  return (
    <footer
      className={`lh-zone-footer lh-footer-alt lh-tpl-chrome-${templateId}`}
      aria-label="Letterhead footer"
    >
      <div className="lh-footer-alt-inner">
        <div className="lh-footer-alt-copy">
          {showAddr ? (
            <p className="lh-footer-address">
              {line1}
              {line2 ? `, ${line2}` : ''}
            </p>
          ) : null}
          {showEmail || showPhones || showWebsite ? (
            <p className="lh-footer-contacts">
              {showEmail ? (
                <span className="lh-footer-ltr" dir="ltr">
                  {email}
                </span>
              ) : null}
              {showEmail && showPhones ? ' · ' : null}
              {showPhones ? (
                <span className="lh-footer-ltr" dir="ltr">
                  {phone}
                </span>
              ) : null}
              {(showEmail || showPhones) && showWebsite ? ' · ' : null}
              {showWebsite ? (
                <span className="lh-footer-ltr" dir="ltr">
                  {websiteDisplay}
                </span>
              ) : null}
            </p>
          ) : null}
        </div>
        {showPages ? <p className="lh-footer-page">{pageLabel}</p> : null}
      </div>
    </footer>
  );
}
