'use client';

import {useMemo} from 'react';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {useSectionNav} from '@/hooks/useSectionNav';

const items = [
  {id: 'overview', en: 'Overview', ar: 'نظرة عامة'},
  {id: 'scope', en: 'Scope', ar: 'النطاق'},
  {id: 'sectors', en: 'Sectors Served', ar: 'القطاعات'},
  {id: 'method', en: 'Method', ar: 'منهج العمل'},
  {id: 'related', en: 'Related Services', ar: 'خدمات مرتبطة'},
];

export default function ServiceDetailSubnav({locale}) {
  const ar = locale === 'ar';
  const ids = useMemo(() => items.map((item) => item.id), []);
  const {active, onTabClick} = useSectionNav(ids, {defaultId: 'overview'});

  return (
    <nav
      className="sd-subnav"
      data-sticky-subnav
      aria-label={ar ? 'أقسام الخدمة' : 'Service sections'}
    >
      <div className="sd-shell sd-subnav-inner">
        <div className="sd-subnav-links">
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
        <Link className="sd-subnav-cta" href={`/${locale}/contact`}>
          {ar ? 'تواصل معنا' : 'Get in Touch'}
          <ArrowUpRight size={15} className={ar ? 'sd-flip' : ''} />
        </Link>
      </div>
    </nav>
  );
}
