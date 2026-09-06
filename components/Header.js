'use client';

import Link from 'next/link';
import Image from 'next/image';
import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import {motion, AnimatePresence} from 'motion/react';
import {ArrowUpRight, ChevronDown, Globe2, MapPin, Menu, Search, X} from 'lucide-react';

const EASE = [0.16, 1, 0.3, 1];

const links = [
  ['About', 'about'],
  ['Services', 'services'],
  ['Projects', 'projects'],
  ['Portfolio', 'portfolio'],
  ['Sectors', 'sectors'],
  ['Careers', 'careers'],
  ['Downloads', 'downloads'],
  ['Contact', 'contact'],
];

const labelsAr = {
  About: 'من نحن',
  Services: 'الخدمات',
  Projects: 'المشاريع',
  Portfolio: 'المحفظة',
  Sectors: 'القطاعات',
  Careers: 'الوظائف',
  Downloads: 'التحميلات',
  Contact: 'تواصل',
};

export default function Header({locale}) {
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const ar = locale === 'ar';
  const otherLocale = ar ? 'en' : 'ar';
  const languageHref = `/${otherLocale}${pathname.replace(/^\/(en|ar)/, '') || ''}`;
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 28);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('asas-home-chrome', isHome);
    document.documentElement.style.setProperty('--ph-chrome', solid ? '80px' : '133px');
    return () => {
      document.documentElement.classList.remove('asas-home-chrome');
      document.documentElement.style.removeProperty('--ph-chrome');
    };
  }, [isHome, solid]);

  return (
    <div className={`asas-chrome${isHome ? ' is-home' : ''}${solid ? ' is-solid' : ''}${open ? ' is-open' : ''}`}>
      <motion.div
        className="asas-topbar"
        initial={{y: -20, opacity: 0}}
        animate={{
          y: solid ? -42 : 0,
          opacity: solid ? 0 : 1,
          height: solid ? 0 : 41,
        }}
        transition={{duration: 0.45, ease: EASE}}
      >
        <div className="asas-topbar-inner">
          <p className="asas-topbar-tag">
            <i />
            {ar ? 'هندسة لمستقبل أفضل' : 'Engineering a better tomorrow'}
          </p>
          <p className="asas-topbar-center">
            ASAS Engineering &amp; Project Management Consultancy · Abu Dhabi, UAE
          </p>
          <div className="asas-topbar-meta">
            <span>
              <MapPin size={12} aria-hidden="true" />
              {ar ? 'أبوظبي، الإمارات' : 'Abu Dhabi, UAE'}
            </span>
            <i className="asas-topbar-divider" aria-hidden="true" />
            <Link href={languageHref} className="asas-topbar-lang">
              <Globe2 size={12} aria-hidden="true" />
              {ar ? 'EN' : 'العربية'}
              <ChevronDown size={11} aria-hidden="true" />
            </Link>
            <i className="asas-topbar-divider" aria-hidden="true" />
            <a className="asas-topbar-search" href={`/${locale}/projects`} aria-label={ar ? 'بحث المشاريع' : 'Search projects'}>
              <Search size={13} aria-hidden="true" />
            </a>
          </div>
        </div>
      </motion.div>

      <motion.header
        className="asas-header"
        initial={{y: -10, opacity: 0}}
        animate={{y: 0, opacity: 1}}
        transition={{duration: 0.7, delay: 0.06, ease: EASE}}
      >
        <div className="asas-header-inner">
          <motion.div
            className="asas-logo"
            initial={{opacity: 0, scale: 0.94}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.55, delay: 0.16, ease: EASE}}
          >
            <Link href={`/${locale}`} aria-label="ASAS home" className="asas-logo-link">
              <Image src="/brand/asas-mark-header.png" alt="ASAS" width={64} height={64} priority />
            </Link>
          </motion.div>

          <nav className={`asas-nav${open ? ' is-open' : ''}`} aria-label={ar ? 'التنقل الرئيسي' : 'Primary'}>
            {links.map(([en, path], i) => {
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
                    {ar ? labelsAr[en] : en}
                  </Link>
                </motion.div>
              );
            })}
            <Link
              className="asas-nav-mobile-cta"
              href={`/${locale}/project-enquiry`}
              onClick={() => setOpen(false)}
            >
              {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
              <ArrowUpRight size={15} />
            </Link>
          </nav>

          <div className="asas-header-actions">
            <motion.div
              initial={{opacity: 0, x: 12}}
              animate={{opacity: 1, x: 0}}
              transition={{duration: 0.5, delay: 0.48, ease: EASE}}
            >
              <Link className="asas-cta" href={`/${locale}/project-enquiry`}>
                <span>{ar ? 'ابدأ مشروعاً' : 'Start a Project'}</span>
                <ArrowUpRight size={16} />
              </Link>
            </motion.div>
            <button
              type="button"
              className="asas-menu"
              aria-label={open ? (ar ? 'إغلاق القائمة' : 'Close menu') : ar ? 'فتح القائمة' : 'Open menu'}
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
            aria-label={ar ? 'إغلاق' : 'Close'}
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
