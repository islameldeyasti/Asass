'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';

const items = [
  {id: 'overview', en: 'Overview', ar: 'نظرة عامة'},
  {id: 'scope', en: 'Scope', ar: 'النطاق'},
  {id: 'sectors', en: 'Sectors Served', ar: 'القطاعات'},
  {id: 'method', en: 'Method', ar: 'منهج العمل'},
  {id: 'related', en: 'Related Services', ar: 'خدمات مرتبطة'},
];

export default function ServiceDetailSubnav({locale}) {
  const ar = locale === 'ar';
  const [active, setActive] = useState('overview');

  useEffect(() => {
    const nodes = items.map((item) => document.getElementById(item.id)).filter(Boolean);
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
    <nav className="sd-subnav" aria-label={ar ? 'أقسام الخدمة' : 'Service sections'}>
      <div className="sd-shell sd-subnav-inner">
        <div className="sd-subnav-links">
          {items.map(({id, en, ar: labelAr}) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'is-active' : ''}
              onClick={(event) => {
                event.preventDefault();
                scrollTo(id);
              }}
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
