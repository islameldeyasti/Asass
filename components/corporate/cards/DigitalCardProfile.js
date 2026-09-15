'use client';

import {useEffect, useMemo, useState} from 'react';
import {buildCardViewModel} from '@/components/corporate/cards/card-model';
import {TEMPLATE_RENDERERS} from '@/components/corporate/cards/templates';
import {normalizeDigitalCard, buildPublicCardPath} from '@/lib/cms/corporate/employee-cards';
import '@/app/corporate-cards.css';

async function trackEvent(publicId, type) {
  if (!publicId || !type) return;
  try {
    await fetch('/api/public/card-event', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({publicId, type}),
    });
  } catch {
    // ignore analytics failures
  }
}

export default function DigitalCardProfile({
  member,
  card: rawCard,
  company,
  locale = 'en',
  qrDataUrl = '',
  compact = false,
  trackViews = false,
  branding,
  profileUrl = '',
  unavailable = false,
}) {
  const [shareHint, setShareHint] = useState('');
  const card = useMemo(() => normalizeDigitalCard(rawCard), [rawCard]);
  // Keep path relative during render so SSR and client markup match.
  const resolvedProfileUrl =
    profileUrl || (card.publicId ? buildPublicCardPath(card.publicId) : '');

  const vm = useMemo(
    () =>
      buildCardViewModel({
        member,
        card,
        company,
        branding,
        locale,
        qrDataUrl,
        profileUrl: resolvedProfileUrl,
      }),
    [member, card, company, branding, locale, qrDataUrl, resolvedProfileUrl],
  );

  useEffect(() => {
    if (!trackViews || unavailable || !card.publicId) return;
    trackEvent(card.publicId, 'view');
  }, [trackViews, unavailable, card.publicId]);

  function absoluteProfileUrl() {
    const raw = resolvedProfileUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (!raw) return '';
    if (/^https?:\/\//i.test(raw)) return raw;
    if (typeof window === 'undefined') return raw;
    return `${window.location.origin}${raw.startsWith('/') ? raw : `/${raw}`}`;
  }

  async function onShare() {
    const url = absoluteProfileUrl() || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: vm.name,
          text: `${vm.name} — ${vm.title || vm.companyName}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareHint(vm.ar ? 'تم نسخ الرابط' : 'Link copied');
        setTimeout(() => setShareHint(''), 2000);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setShareHint(vm.ar ? 'تم نسخ الرابط' : 'Link copied');
        setTimeout(() => setShareHint(''), 2000);
      } catch {
        setShareHint('');
      }
    }
  }

  function onSaveContact() {
    const id = card.publicId;
    const href = id
      ? `/api/public/vcard?publicId=${encodeURIComponent(id)}`
      : `/api/public/vcard?slug=${encodeURIComponent(member?.slug || '')}`;
    window.location.href = href;
  }

  function onTrack(type) {
    const map = {
      call: 'call',
      email: 'email',
      whatsapp: 'whatsapp',
      vcard: 'vcard',
      share: 'share',
      linkedin: 'contact',
      download: 'download',
      portfolio: 'contact',
      company: 'contact',
    };
    trackEvent(card.publicId, map[type] || 'contact');
  }

  if (unavailable) {
    return (
      <article className="dcard dcard--unavailable" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="dcard-shell">
          <div className="dcard-body dcard-body--centered dcard-body--airy">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="dcard-logo"
              src={branding?.lightLogo || branding?.primaryLogo || '/brand/asas-logo-light.png'}
              alt="ASAS"
            />
            <h1 className="dcard-name">
              {locale === 'ar' ? 'البطاقة غير متاحة' : 'Card unavailable'}
            </h1>
            <p className="dcard-bio">
              {locale === 'ar'
                ? 'بطاقة العمل الرقمية هذه غير منشورة حالياً. يرجى التواصل مع أساس للاستشارات الهندسية.'
                : 'This digital business card is currently unavailable. Please contact ASAS Engineering & Project Management Consultancy.'}
            </p>
            {company?.website ? (
              <a className="dcard-action dcard-action--solid" href={`https://${company.website}`}>
                {locale === 'ar' ? 'زيارة الموقع' : 'Visit website'}
              </a>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  const Renderer = TEMPLATE_RENDERERS[vm.templateId] || TEMPLATE_RENDERERS['asas-executive'];
  const handlers = {onTrack, onShare, onSaveContact};

  return (
    <div className={compact ? 'dcard-wrap is-compact' : 'dcard-wrap'}>
      <Renderer vm={vm} handlers={handlers} />
      {shareHint ? <p className="dcard-share-hint">{shareHint}</p> : null}
    </div>
  );
}
