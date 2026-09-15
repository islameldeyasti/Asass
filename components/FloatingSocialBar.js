'use client';

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import SocialIconLinks from '@/components/social/SocialIconLinks';
import {t} from '@/lib/i18n/ui';

const HERO_SELECTORS = [
  '[data-asas-hero]',
  '.asas-ph',
  '.sv-hero',
  '.sd-hero',
  '.sc-hero',
  '.cp-hero',
  '.pd-hero',
  '.pl-hero',
  '.pf-hero',
  '.tm-page-hero',
  '.about-hero',
  '.contact-hero',
  '.careers-hero',
  '.careers-detail-hero',
  '.downloads-hero',
  '.enquiry-hero',
  '.sectors-hero',
  '.gallery-hero',
  '.blog-hero',
  'main#main > section:first-of-type',
  'main > section:first-of-type',
].join(', ');

function findFirstBand() {
  return document.querySelector(HERO_SELECTORS);
}

function findFooter() {
  return document.querySelector('footer.site-footer, footer.asas-footer, footer');
}

function bandPastViewport(el) {
  if (!el) return true;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  const ratio = Math.max(0, Math.min(1, visible / Math.max(rect.height, 1)));
  const pastByRatio = ratio < 0.4;
  const pastByBottom = rect.bottom < vh * 0.55;
  return pastByRatio || pastByBottom;
}

function footerInView(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  // Hide once the footer top reaches the lower half of the viewport.
  return rect.top < vh * 0.72;
}

/** Fixed left-side social stack — hidden on first section and over the footer. */
export default function FloatingSocialBar({locale = 'en'}) {
  const pathname = usePathname() || '';
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let heroObserver;
    let footerObserver;
    let scrollRaf = 0;

    const sync = () => {
      if (cancelled) return;
      const hero = findFirstBand();
      const footer = findFooter();
      const pastHero = bandPastViewport(hero);
      const overFooter = footerInView(footer);
      setVisible(pastHero && !overFooter);
    };

    const observe = () => {
      heroObserver?.disconnect();
      footerObserver?.disconnect();

      const hero = findFirstBand();
      const footer = findFooter();

      if (hero) {
        heroObserver = new IntersectionObserver(() => sync(), {
          threshold: [0, 0.15, 0.3, 0.4, 0.55, 0.75, 1],
        });
        heroObserver.observe(hero);
      }

      if (footer) {
        footerObserver = new IntersectionObserver(() => sync(), {
          threshold: [0, 0.05, 0.15, 0.3, 0.5, 0.75, 1],
          rootMargin: '0px 0px -20% 0px',
        });
        footerObserver.observe(footer);
      }

      sync();
    };

    const onScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        sync();
      });
    };

    // Allow route content to paint before querying heroes.
    const boot = requestAnimationFrame(() => {
      observe();
      // Second pass after layout / images settle.
      window.setTimeout(observe, 120);
    });

    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});

    return () => {
      cancelled = true;
      cancelAnimationFrame(boot);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      heroObserver?.disconnect();
      footerObserver?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  const className = ['asas-float-social', visible ? 'is-visible' : 'is-hidden']
    .filter(Boolean)
    .join(' ');

  return (
    <nav
      className={className}
      aria-label={t('socialMedia', locale)}
      aria-hidden={visible ? undefined : true}
    >
      <SocialIconLinks variant="float" locale={locale} />
    </nav>
  );
}
