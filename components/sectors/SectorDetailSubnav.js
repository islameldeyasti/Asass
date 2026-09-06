'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {FileDown} from 'lucide-react';

const items = [
  {id: 'overview', en: 'Overview', ar: 'نظرة عامة'},
  {id: 'capabilities', en: 'Capabilities', ar: 'القدرات'},
  {id: 'approach', en: 'Our Approach', ar: 'منهجيتنا'},
  {id: 'projects', en: 'Featured Projects', ar: 'مشاريع مميزة'},
  {id: 'related-sectors', en: 'Related Sectors', ar: 'قطاعات مرتبطة'},
];

export default function SectorDetailSubnav({locale, showDownload, downloadHref, downloadLabel}) {
  const ar = locale === 'ar';
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      {rootMargin: '-28% 0px -55% 0px', threshold: [0.1, 0.35, 0.6]},
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({behavior: 'smooth', block: 'start'});
    setActive(id);
  };

  return (
    <nav className="sc-subnav" aria-label={ar ? 'أقسام القطاع' : 'Sector sections'}>
      <div className="sc-shell sc-subnav-inner">
        <div className="sc-subnav-links">
          {items.map(({id, en, ar: labelAr}) => {
            // Skip links for sections not present in DOM
            return (
              <a
                key={id}
                href={`#${id}`}
                className={active === id ? 'is-active' : ''}
                onClick={(event) => {
                  event.preventDefault();
                  if (!document.getElementById(id)) return;
                  scrollTo(id);
                }}
              >
                {ar ? labelAr : en}
              </a>
            );
          })}
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
