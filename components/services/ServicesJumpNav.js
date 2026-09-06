'use client';

import {useEffect, useState} from 'react';
import {ClipboardCheck, Compass, PenTool} from 'lucide-react';
import {serviceGroups} from '@/data/services';

const groups = [
  {id: 'design', en: serviceGroups.design.en, ar: serviceGroups.design.ar, Icon: PenTool},
  {id: 'delivery', en: serviceGroups.delivery.en, ar: serviceGroups.delivery.ar, Icon: ClipboardCheck},
  {
    id: 'planning',
    en: 'Planning & Specialist',
    ar: serviceGroups.planning.ar,
    Icon: Compass,
  },
];

export default function ServicesJumpNav({locale}) {
  const ar = locale === 'ar';
  const [active, setActive] = useState('design');

  useEffect(() => {
    const nodes = groups.map((group) => document.getElementById(group.id)).filter(Boolean);
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      {rootMargin: '-28% 0px -55% 0px', threshold: [0.12, 0.35, 0.6]},
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
    <nav className="sv-jump" aria-label={ar ? 'أقسام الخدمات' : 'Service categories'}>
      <div className="sv-shell sv-jump-inner">
        <div className="sv-jump-tabs">
          {groups.map(({id, en, ar: labelAr, Icon}) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'is-active' : ''}
              onClick={(event) => {
                event.preventDefault();
                scrollTo(id);
              }}
            >
              <Icon size={15} aria-hidden="true" />
              {ar ? labelAr : en}
            </a>
          ))}
        </div>
        <p className="sv-jump-note">
          <span className="sv-jump-divider" aria-hidden="true" />
          {ar ? 'خدمات شاملة. أثر دائم.' : 'Comprehensive services. Lasting impact.'}
        </p>
      </div>
    </nav>
  );
}
