'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';

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
      {rootMargin: '-28% 0px -55% 0px', threshold: [0.1, 0.35, 0.55]},
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="cp-subnav" aria-label={ar ? 'أقسام الملف التعريفي' : 'Company profile sections'}>
      <div className="cp-shell cp-subnav-inner">
        <div className="cp-subnav-links">
          {items.map(({id, en, ar: labelAr}) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'is-active' : ''}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
                setActive(id);
              }}
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
