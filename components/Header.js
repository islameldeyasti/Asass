'use client';

import Link from 'next/link';
import {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import {motion, AnimatePresence} from 'motion/react';
import {ArrowUpRight, ChevronDown, MapPin, Menu, Search, X} from 'lucide-react';
import {company} from '@/data/company';
import ThemeLogo from '@/components/theme/ThemeLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import SiteSearch from '@/components/SiteSearch';
import {t, tNav} from '@/lib/i18n/ui';
import {enterX} from '@/lib/motion/rtl';

const EASE = [0.16, 1, 0.3, 1];

const navItems = [
  {label: 'Home', path: '', home: true},
  {
    label: 'About',
    path: 'about',
    children: [
      {label: 'Company Profile', path: 'company-profile'},
      {label: 'Gallery', path: 'gallery'},
      {label: 'Team', path: 'team'},
    ],
  },
  {label: 'Services', path: 'services'},
  {label: 'Projects', path: 'projects'},
  // Hidden from nav (not deleted) — restore by removing hidden
  {label: 'Portfolio', path: 'portfolio', hidden: true},
  {label: 'Sectors', path: 'sectors'},
  {label: 'Blog', path: 'blog'},
  {label: 'Careers', path: 'careers'},
  {label: 'Contact', path: 'contact'},
];

function pathActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavDropdown({item, locale, pathname, onNavigate, delay = 0}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const href = `/${locale}/${item.path}`;
  const childActive = item.children.some((child) =>
    pathActive(pathname, `/${locale}/${child.path}`),
  );
  const active = pathActive(pathname, href) || childActive;

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <motion.div
      ref={rootRef}
      className={`asas-nav-item asas-nav-item--drop${open ? ' is-open' : ''}${active ? ' is-active' : ''}`}
      initial={{opacity: 0, y: -8}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.4, delay, ease: EASE}}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="asas-nav-parent">
        <Link
          href={href}
          onClick={onNavigate}
          aria-current={pathActive(pathname, href) ? 'page' : undefined}
          className={active ? 'is-active' : undefined}
        >
          {tNav(item.label, locale)}
        </Link>
        <button
          type="button"
          className="asas-nav-caret"
          aria-expanded={open}
          aria-label={locale === 'ar' ? 'فتح قائمة من نحن' : 'Open About menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </div>

      <div className={`asas-nav-submenu${open ? ' is-open' : ''}`} role="list">
        {item.children.map((child) => {
          const childHref = `/${locale}/${child.path}`;
          const isChildActive = pathActive(pathname, childHref);
          return (
            <Link
              key={child.path}
              href={childHref}
              role="listitem"
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              aria-current={isChildActive ? 'page' : undefined}
              className={isChildActive ? 'is-active' : undefined}
            >
              {tNav(child.label, locale)}
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Header({locale}) {
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const ar = locale === 'ar';
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    ar ? company.addressAr : company.address,
  )}`;
  const visibleItems = navItems.filter((item) => !item.hidden);

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

  useEffect(() => {
    const id = window.setTimeout(() => {
      setOpen(false);
      setSearchOpen(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

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
            <button
              type="button"
              className="asas-topbar-search"
              aria-label={t('searchSite', locale)}
              aria-expanded={searchOpen}
              onClick={() => {
                setOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search size={13} aria-hidden="true" />
            </button>
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
            {visibleItems.map((item, i) => {
              if (item.children?.length) {
                return (
                  <NavDropdown
                    key={item.path}
                    item={item}
                    locale={locale}
                    pathname={pathname}
                    delay={0.2 + i * 0.045}
                    onNavigate={() => setOpen(false)}
                  />
                );
              }

              const href = item.home ? `/${locale}` : `/${locale}/${item.path}`;
              const active = item.home
                ? pathname === `/${locale}` || pathname === `/${locale}/`
                : pathActive(pathname, href);
              return (
                <motion.div
                  key={item.path || item.label}
                  className="asas-nav-item"
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
                    {tNav(item.label, locale)}
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
            <button
              type="button"
              className="asas-header-search"
              aria-label={t('searchSite', locale)}
              aria-expanded={searchOpen}
              onClick={() => {
                setOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search size={18} aria-hidden="true" />
            </button>
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

      <SiteSearch locale={locale} open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
