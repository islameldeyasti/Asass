'use client';

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import SocialIconLinks from '@/components/social/SocialIconLinks';
import {t} from '@/lib/i18n/ui';

/** Fixed left-side social stack — hidden over home hero; on inside pages sits above the hero. */
export default function FloatingSocialBar({locale = 'en'}) {
  const pathname = usePathname() || '';
  const isHome =
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    pathname === '/' ||
    pathname === '';
  const [pastHero, setPastHero] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setPastHero(true);
      return undefined;
    }

    setPastHero(false);
    const hero = document.querySelector('[data-asas-hero], .asas-ph');
    if (!hero) {
      setPastHero(true);
      return undefined;
    }

    const update = (entry) => {
      // Show once most of the hero has scrolled away (into second section).
      const ratio = entry?.intersectionRatio ?? 1;
      const bottom = entry?.boundingClientRect?.bottom ?? hero.getBoundingClientRect().bottom;
      const pastByRatio = ratio < 0.4;
      const pastByBottom = bottom < window.innerHeight * 0.55;
      setPastHero(pastByRatio || pastByBottom);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) update(entry);
      },
      {
        threshold: [0, 0.15, 0.3, 0.4, 0.55, 0.75, 1],
      },
    );
    observer.observe(hero);

    // Sync once in case user landed mid-page / restored scroll.
    update({
      intersectionRatio: 1,
      boundingClientRect: hero.getBoundingClientRect(),
    });
    // Re-evaluate with a real IO-like reading after layout.
    requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const ratio = Math.max(0, Math.min(1, visible / Math.max(rect.height, 1)));
      update({intersectionRatio: ratio, boundingClientRect: rect});
    });

    return () => observer.disconnect();
  }, [isHome, pathname]);

  const className = [
    'asas-float-social',
    isHome ? null : 'is-internal',
    isHome && !pastHero ? 'is-hero-hidden' : 'is-past-hero',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav
      className={className}
      aria-label={t('socialMedia', locale)}
      aria-hidden={isHome && !pastHero ? true : undefined}
    >
      <SocialIconLinks variant="float" locale={locale} />
    </nav>
  );
}
