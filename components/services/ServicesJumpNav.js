'use client';

import {useEffect, useState} from 'react';

const groups = [
  {id: 'design', en: 'Design & Engineering', ar: 'التصميم والهندسة'},
  {id: 'delivery', en: 'Project Delivery', ar: 'تنفيذ المشاريع'},
  {id: 'planning', en: 'Planning & Specialist', ar: 'التخطيط والخدمات المتخصصة'},
];

export default function ServicesJumpNav({locale}) {
  const ar = locale === 'ar';
  const [active, setActive] = useState('design');

  useEffect(() => {
    const nodes = groups.map((group) => document.getElementById(group.id)).filter(Boolean);
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    }, {rootMargin: '-30% 0px -55% 0px', threshold: [0.15, 0.4, 0.7]});
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="services-jump" aria-label={ar ? 'أقسام الخدمات' : 'Service categories'}>
      <div className="container services-jump-inner">
        {groups.map((group) => (
          <a
            key={group.id}
            href={`#${group.id}`}
            className={active === group.id ? 'is-active' : ''}
          >
            {ar ? group.ar : group.en}
          </a>
        ))}
      </div>
    </nav>
  );
}
