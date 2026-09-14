'use client';

import {pickLocale} from '@/components/corporate/cards/card-model';
import {normalizeDigitalCard, getCardTemplate} from '@/lib/cms/corporate/employee-cards';

function Logo({invert = false, branding}) {
  const light = branding?.lightLogo || branding?.primaryLogo || '/brand/asas-logo-light.png';
  const dark = branding?.darkLogo || '/brand/asas-logo-dark.png';
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="bc-logo" src={invert ? dark : light} alt="ASAS" />
  );
}

/**
 * Printable business card sheet — front + back (~85mm × 55mm).
 * Designed as true print compositions (not mobile card screenshots).
 */
export default function BusinessCardSheet({
  member,
  card: rawCard,
  company,
  locale = 'en',
  qrDataUrl = '',
  branding,
}) {
  const ar = locale === 'ar';
  const card = normalizeDigitalCard(rawCard);
  const template = getCardTemplate(card.templateId);
  const name = pickLocale(ar, member?.name_en, member?.name_ar);
  const title = pickLocale(ar, member?.job_title_en, member?.job_title_ar);
  const companyName = pickLocale(ar, company?.name, company?.nameAr) || 'ASAS Engineering';
  const photo = member?.profile_image || '';
  const dark =
    template.printStyle === 'dark' ||
    template.id === 'executive-dark' ||
    template.id === 'modern-split';
  const phone = card.showPhone ? member?.phone : '';
  const email = card.showEmail ? member?.email : '';
  const website = (card.website || company?.website || 'www.asasengg.ae').replace(/^https?:\/\//, '');

  return (
    <div
      className={`bc-sheet bc-sheet--${template.printStyle || 'executive'} bc-sheet--${template.id}`}
      dir={ar ? 'rtl' : 'ltr'}
    >
      <section className={`bc-face bc-face--front${dark ? ' is-dark' : ''}`}>
        <div className="bc-safe">
          <div className="bc-front-top">
            <Logo invert={dark} branding={branding} />
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="bc-photo"
                src={photo}
                alt=""
                style={{objectPosition: member?.profile_image_focal || '50% 30%'}}
              />
            ) : null}
          </div>
          <div className="bc-front-copy">
            <strong className="bc-name">{name}</strong>
            <span className="bc-role">{title}</span>
            <span className="bc-company">{companyName}</span>
          </div>
          <ul className="bc-contact">
            {phone ? (
              <li dir="ltr">{phone}</li>
            ) : null}
            {email ? (
              <li dir="ltr">{email}</li>
            ) : null}
            <li dir="ltr">{website}</li>
          </ul>
        </div>
      </section>

      <section className={`bc-face bc-face--back${dark ? ' is-dark' : ''}`}>
        <div className="bc-safe bc-back-grid">
          <div>
            <Logo invert={dark} branding={branding} />
            <p className="bc-back-cta">
              {ar ? 'امسح رمز QR لحفظ جهة الاتصال' : 'Scan to open digital card & save contact'}
            </p>
            <p className="bc-back-web" dir="ltr">
              {website}
            </p>
          </div>
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="bc-qr" src={qrDataUrl} alt="" width={96} height={96} />
          ) : (
            <div className="bc-qr bc-qr--empty">QR</div>
          )}
        </div>
      </section>
    </div>
  );
}
