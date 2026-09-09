'use client';

import {useMemo} from 'react';
import Link from 'next/link';
import {FileDown} from 'lucide-react';
import {useSectionNav} from '@/hooks/useSectionNav';

const items = [
  {id: 'overview', en: 'Overview', ar: 'نظرة عامة'},
  {id: 'capabilities', en: 'Capabilities', ar: 'القدرات'},
  {id: 'approach', en: 'Our Approach', ar: 'منهجيتنا'},
  {id: 'projects', en: 'Featured Projects', ar: 'مشاريع مميزة'},
  {id: 'related-sectors', en: 'Related Sectors', ar: 'قطاعات مرتبطة'},
];

export default function SectorDetailSubnav({locale, showDownload, downloadHref, downloadLabel}) {
  const ar = locale === 'ar';
  const ids = useMemo(() => items.map((item) => item.id), []);
  const {active, onTabClick} = useSectionNav(ids, {defaultId: 'overview'});

  return (
    <nav
      className="sc-subnav"
      data-sticky-subnav
      aria-label={ar ? 'أقسام القطاع' : 'Sector sections'}
    >
      <div className="sc-shell sc-subnav-inner">
        <div className="sc-subnav-links">
          {items.map(({id, en, ar: labelAr}) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'is-active' : ''}
              onClick={(event) => {
                if (!document.getElementById(id)) {
                  event.preventDefault();
                  return;
                }
                onTabClick(event, id);
              }}
            >
              {ar ? labelAr : en}
            </a>
          ))}
        </div>
        {showDownload && downloadHref && (
          <Link className="sc-subnav-download" href={downloadHref} target="_blank" rel="noopener noreferrer">
            <FileDown size={15} aria-hidden="true" />
            {downloadLabel}
          </Link>
        )}
      </div>
    </nav>
  );
}
