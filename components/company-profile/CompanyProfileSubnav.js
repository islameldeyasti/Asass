'use client';

import {useMemo} from 'react';
import Link from 'next/link';
import {useSectionNav} from '@/hooks/useSectionNav';

const items = [
  {id: 'overview', en: 'Overview', ar: 'نظرة عامة'},
  {id: 'story', en: 'Our Story', ar: 'قصتنا'},
  {id: 'capabilities', en: 'Capabilities', ar: 'القدرات'},
  {id: 'sectors', en: 'Sectors', ar: 'القطاعات'},
  {id: 'approach', en: 'Approach', ar: 'المنهجية'},
  {id: 'projects', en: 'Projects', ar: 'المشاريع'},
  {id: 'contact', en: 'Contact', ar: 'تواصل'},
];

export default function CompanyProfileSubnav({locale}) {
  const ar = locale === 'ar';
  const ids = useMemo(() => items.map((item) => item.id), []);
  const {active, onTabClick} = useSectionNav(ids, {defaultId: 'overview'});

  return (
    <nav
      className="cp-subnav"
      data-sticky-subnav
      aria-label={ar ? 'أقسام الملف التعريفي' : 'Company profile sections'}
    >
      <div className="cp-shell cp-subnav-inner">
        <div className="cp-subnav-links">
          {items.map(({id, en, ar: labelAr}) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'is-active' : ''}
              onClick={(event) => onTabClick(event, id)}
            >
              {ar ? labelAr : en}
            </a>
          ))}
        </div>
        <Link className="cp-subnav-cta" href={`/${locale}/project-enquiry`}>
          {ar ? 'استفسار مشروع' : 'Project Enquiry'}
        </Link>
      </div>
    </nav>
  );
}
