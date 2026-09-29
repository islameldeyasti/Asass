'use client';

import {useCallback, useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import {t} from '@/lib/i18n/ui';

const STORAGE_KEY = 'asas_site_tour_done_v1';
const DESKTOP_MQ = '(min-width: 1100px) and (hover: hover) and (pointer: fine)';

const STEPS = [
  {id: 'welcome', target: null, title: 'tourWelcomeTitle', body: 'tourWelcomeBody'},
  {id: 'about', target: '[data-tour="nav-about"]', title: 'tourAboutTitle', body: 'tourAboutBody'},
  {id: 'services', target: '[data-tour="nav-services"]', title: 'tourServicesTitle', body: 'tourServicesBody'},
  {id: 'projects', target: '[data-tour="nav-projects"]', title: 'tourProjectsTitle', body: 'tourProjectsBody'},
  {id: 'cta', target: '[data-tour="nav-cta"]', title: 'tourCtaTitle', body: 'tourCtaBody'},
];

function isDesktop() {
  return typeof window !== 'undefined' && window.matchMedia(DESKTOP_MQ).matches;
}

function targetRect(selector) {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return null;
  return {top: r.top, left: r.left, width: r.width, height: r.height};
}

export default function SiteTour({locale = 'en'}) {
  const pathname = usePathname() || `/${locale}`;
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [spot, setSpot] = useState(null);

  const finish = useCallback((persist) => {
    document.documentElement.classList.remove('asas-tour-on', 'asas-tour-about');
    document.querySelector('[data-tour="nav-about"]')?.classList.remove('is-open');
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
    }
    setActive(false);
  }, []);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        if (localStorage.getItem(STORAGE_KEY) === '1') return;
      } catch {
        return;
      }
      if (!isDesktop()) return;
      setActive(true);
      setIndex(0);
    }, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname]);

  useEffect(() => {
    if (!active) return undefined;
    document.documentElement.classList.add('asas-tour-on');
    const step = STEPS[index];
    const aboutOpen = step?.id === 'about';
    document.documentElement.classList.toggle('asas-tour-about', aboutOpen);
    const aboutEl = document.querySelector('[data-tour="nav-about"]');
    aboutEl?.classList.toggle('is-open', aboutOpen);

    const measure = () => setSpot(targetRect(step?.target));
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    const onKey = (event) => {
      if (event.key === 'Escape') finish(true);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [active, index, finish]);

  if (!active) return null;

  const step = STEPS[index];
  const last = index === STEPS.length - 1;
  const pad = 10;
  const spotlight = spot
    ? {
        top: Math.max(8, spot.top - pad),
        left: Math.max(8, spot.left - pad),
        width: spot.width + pad * 2,
        height: spot.height + pad * 2,
      }
    : null;

  let cardStyle = {top: '22vh', left: '50%', transform: 'translateX(-50%)'};
  if (spotlight) {
    const below = spotlight.top + spotlight.height + 16;
    const preferLeft = locale === 'ar';
    const width = 360;
    const left = preferLeft
      ? Math.max(24, spotlight.left + spotlight.width - width)
      : Math.min(window.innerWidth - width - 24, Math.max(24, spotlight.left));
    cardStyle =
      below + 220 < window.innerHeight
        ? {top: below, left, transform: 'none'}
        : {top: Math.max(24, spotlight.top - 210), left, transform: 'none'};
  }

  return (
    <div className="asas-tour" role="dialog" aria-modal="true" aria-labelledby="asas-tour-title">
      <button type="button" className="asas-tour-scrim" aria-label={t('tourSkip', locale)} onClick={() => finish(true)} />
      {spotlight ? (
        <div
          className="asas-tour-spot"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
        />
      ) : null}
      <div className="asas-tour-card" style={cardStyle}>
        <p className="asas-tour-kicker">
          {index + 1} / {STEPS.length}
        </p>
        <h2 id="asas-tour-title">{t(step.title, locale)}</h2>
        <p>{t(step.body, locale)}</p>
        <div className="asas-tour-actions">
          <button type="button" className="asas-tour-skip" onClick={() => finish(true)}>
            {t('tourSkip', locale)}
          </button>
          <div className="asas-tour-nav">
            {index > 0 ? (
              <button type="button" className="asas-tour-back" onClick={() => setIndex((n) => n - 1)}>
                {t('tourBack', locale)}
              </button>
            ) : null}
            <button
              type="button"
              className="asas-tour-next"
              onClick={() => {
                if (last) finish(true);
                else setIndex((n) => n + 1);
              }}
            >
              {last ? t('tourDone', locale) : t('tourNext', locale)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
