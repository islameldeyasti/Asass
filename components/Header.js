'use client';

import Link from 'next/link';
import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import {ArrowUpRight, Menu, X} from 'lucide-react';
import Brand from './Brand';

const links = [
  ['About', 'about'],
  ['Services', 'services'],
  ['Projects', 'projects'],
  ['Sectors', 'sectors'],
  ['Careers', 'careers'],
  ['Downloads', 'downloads'],
  ['Contact', 'contact'],
];

const labelsAr = {
  About: 'من نحن',
  Services: 'الخدمات',
  Projects: 'المشاريع',
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

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="announcement">ASAS Engineering &amp; Project Management Consultancy · Abu Dhabi, UAE</div>
      <header className={`header ${solid ? 'solid' : ''}`}>
        <div className="nav">
          <Brand locale={locale} symbolOnly />
          <nav className={open ? 'open' : ''}>
            {links.map(([en, path]) => (
              <Link key={path} onClick={() => setOpen(false)} href={`/${locale}/${path}`}>
                {ar ? labelsAr[en] : en}
              </Link>
            ))}
            <Link className="mobile-enquiry" onClick={() => setOpen(false)} href={`/${locale}/project-enquiry`}>
              {ar ? 'أرسل استفسار مشروع' : 'Start a Project'}
            </Link>
          </nav>
          <div className="nav-actions">
            <Link className="language" href={languageHref}>{ar ? 'EN' : 'العربية'}</Link>
            <Link className="button nav-cta" href={`/${locale}/project-enquiry`}>
              {ar ? 'أرسل استفسار مشروع' : 'Start a Project'} <ArrowUpRight size={16} />
            </Link>
            <button className="menu" onClick={() => setOpen(!open)} aria-label="Toggle menu">
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
