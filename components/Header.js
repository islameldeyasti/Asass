'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import {motion, AnimatePresence} from 'motion/react';
import {ArrowUpRight, MapPin, Menu, Search, X} from 'lucide-react';
import {company} from '@/data/company';
import ThemeLogo from '@/components/theme/ThemeLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {t, tNav} from '@/lib/i18n/ui';
import {enterX} from '@/lib/motion/rtl';

const EASE = [0.16, 1, 0.3, 1];

const links = [
  ['About', 'about'],
  ['Services', 'services'],
  ['Projects', 'projects'],
  // Hidden from nav (not deleted) — restore by setting hidden: false
  ['Portfolio', 'portfolio', {hidden: true}],
  ['Company Profile', 'company-profile'],
  ['Sectors', 'sectors'],
  ['Team', 'team'],
  ['Careers', 'careers'],
  ['Contact', 'contact'],
];

export default function Header({locale}) {
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);
  const ar = locale === 'ar';
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    ar ? company.addressAr : company.address,
  )}`;

  useEffect(() => {
    document.documentElement.classList.toggle('asas-home-chrome', isHome);

    const syncChrome = () => {
      const el = document.querySelector('[data-sticky-chrome], .asas-chrome');
      const h = el ? Math.round(el.getBoundingClientRect().height) : 0;
      if (h > 0) {
        document.documentElement.style.setProperty('--ph-chrome', `${h}px`);
        document.documentElement.style.setProperty('--asas-chrome-h', `${h}px`);
      }
    };

    syncChrome();
    window.addEventListener('resize', syncChrome, {passive: true});
    return () => {
      document.documentElement.classList.remove('asas-home-chrome');
      document.documentElement.style.removeProperty('--ph-chrome');
      document.documentElement.style.removeProperty('--asas-chrome-h');
      window.removeEventListener('resize', syncChrome);
    };
  }, [isHome]);

  useEffect(() => {
    document.body.classList.toggle('asas-nav-lock', open);
    return () => document.body.classList.remove('asas-nav-lock');
  }, [open]);

  return (
    <div
      className={`asas-chrome${isHome ? ' is-home' : ''}${open ? ' is-open' : ''}`}
      data-sticky-chrome
    >
      <div className="asas-topbar">
        <div className="asas-topbar-inner">
          <p className="asas-topbar-tag">
            <i />
            {t('engineeringTomorrow', locale)}
          </p>
          <p className="asas-topbar-center">
            {ar
              ? `${company.nameAr} · ${t('abuDhabiUae', locale)}`
              : 'ASAS Engineering & Project Management Consultancy · Abu Dhabi, UAE'}
          </p>
          <div className="asas-topbar-meta">
            <a
              className="asas-topbar-location"
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={12} aria-hidden="true" />
              {t('abuDhabiUae', locale)}
            </a>
            <i className="asas-topbar-divider" aria-hidden="true" />
            <a
              className="asas-topbar-search"
              href={`/${locale}/projects`}
              aria-label={t('searchProjects', locale)}
            >
              <Search size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <motion.header
        className="asas-header"
        initial={{y: -10, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        transition={{duration: 0.7, delay: 0.06, ease: EASE}}
      >
        <div className="asas-header-inner">
          <motion.div
            className="asas-logo"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{duration: 0.55, delay: 0.16, ease: EASE}}
          >
            <Link href={`/${locale}`} aria-label={t('homeAria', locale)} className="asas-logo-link">
              <ThemeLogo width={62} height={62} priority />
            </Link>
          </motion.div>

          <nav className={`asas-nav${open ? ' is-open' : ''}`} aria-label={t('primaryNav', locale)}>
            {links
              .filter(([, , opts]) => !opts?.hidden)
              .map(([en, path], i) => {
                const href = `/${locale}/${path}`;
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <motion.div
                    key={path}
                    initial={{opacity: 0, y: -8}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.4, delay: 0.2 + i * 0.045, ease: EASE}}
                  >
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={active ? 'is-active' : undefined}
                    >
                      {tNav(en, locale)}
                    </Link>
                  </motion.div>
                );
              })}
            <Link
              className="asas-nav-mobile-cta"
              href={`/${locale}/project-enquiry`}
              onClick={() => setOpen(false)}
            >
              {t('startProject', locale)}
              <ArrowUpRight size={15} className={ar ? 'reverse-arrow' : ''} />
            </Link>
          </nav>

          <div className="asas-header-actions">
            <LanguageSwitcher locale={locale} />
            <motion.div
              initial={{opacity: 0, x: enterX(locale, 12)}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.5, delay: 0.48, ease: EASE}}
            >
              <Link className="asas-cta" href={`/${locale}/project-enquiry`}>
                <span>{t('startProject', locale)}</span>
                <ArrowUpRight size={16} className={ar ? 'reverse-arrow' : ''} />
              </Link>
            </motion.div>
            <button
              type="button"
              className="asas-menu"
              aria-label={open ? t('closeMenu', locale) : t('openMenu', locale)}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            className="asas-nav-backdrop"
            aria-label={t('close', locale)}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
