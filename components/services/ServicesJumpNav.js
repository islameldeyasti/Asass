'use client';

import {useMemo} from 'react';
import {ClipboardCheck, Compass, PenTool} from 'lucide-react';
import {serviceGroups} from '@/data/services';
import {useSectionNav} from '@/hooks/useSectionNav';

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
  const ids = useMemo(() => groups.map((group) => group.id), []);
  const {active, onTabClick} = useSectionNav(ids, {defaultId: 'design'});

  return (
    <nav
      className="sv-jump"
      data-sticky-subnav
      aria-label={ar ? 'أقسام الخدمات' : 'Service categories'}
    >
      <div className="sv-shell sv-jump-inner">
        <div className="sv-jump-tabs">
          {groups.map(({id, en, ar: labelAr, Icon}) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'is-active' : ''}
              onClick={(event) => onTabClick(event, id)}
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
