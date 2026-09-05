'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, Building2, CheckCircle2, ClipboardCheck, Layers3, Ruler} from 'lucide-react';
import {serviceImages} from '@/data/image-manifest';
import {stats} from '@/data/company';

const shortTitles = {
  'architectural-design': {en: 'Architecture', ar: 'العمارة'},
  'civil-structural-engineering': {en: 'Structural', ar: 'الإنشاءات'},
  'mep-engineering-design': {en: 'MEP', ar: 'MEP'},
  'quantities-cost': {en: 'QS', ar: 'الكميات'},
  'project-management': {en: 'PM', ar: 'الإدارة'},
};

const icons = {
  'architectural-design': Building2,
  'civil-structural-engineering': Ruler,
  'mep-engineering-design': Layers3,
  'quantities-cost': ClipboardCheck,
  'project-management': ClipboardCheck,
};

export default function ServicesTabs({locale, services}) {
  const ar = locale === 'ar';
  const disciplines = services.filter((service) => shortTitles[service.slug]);
  const [active, setActive] = useState(disciplines[0]?.slug);
  const current = disciplines.find((service) => service.slug === active) || disciplines[0];
  if (!current) return null;

  const Icon = icons[current.slug] || Building2;
  const points = (ar ? current.capabilitiesAr : current.capabilities).slice(0, 3);

  return (
    <section className="insp-services hp-disciplines" id="disciplines">
      <div className="home-shell">
        <div className="insp-center-head">
          <p className="atlas-kicker center">{ar ? 'تخصصاتنا' : 'Our disciplines'}</p>
          <h2>{ar ? 'تخصصات هندسية في مكتب واحد.' : 'One consultancy. Five core disciplines.'}</h2>
          <p>{ar
            ? 'تغطي أساس العمارة والإنشاءات والأعمال الكهروميكانيكية والكميات وإدارة المشاريع ضمن عمل منسق.'
            : 'Architecture, structure, electromechanical services, quantity surveying and project management checked together before issue.'}</p>
        </div>

        <div className="hp-discipline-stats" aria-label={ar ? 'حقائق أساس' : 'ASAS facts'}>
          {stats.map((stat) => (
            <article key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{ar ? stat.labelAr : stat.label}</span>
            </article>
          ))}
        </div>

        <div className="insp-tabs" role="tablist">
          {disciplines.map((service) => {
            const TabIcon = icons[service.slug] || Building2;
            return (
              <button
                key={service.slug}
                type="button"
                role="tab"
                aria-selected={active === service.slug}
                className={active === service.slug ? 'active' : ''}
                onClick={() => setActive(service.slug)}
              >
                <TabIcon size={16} />
                <span>{shortTitles[service.slug][ar ? 'ar' : 'en']}</span>
              </button>
            );
          })}
        </div>

        <div className="insp-tab-panel hp-card">
          <div className="insp-tab-media">
            <Image src={serviceImages[current.slug]} alt="" width={900} height={700} />
          </div>
          <div className="insp-tab-copy">
            <Icon className="insp-tab-icon" />
            <h3>{ar ? current.titleAr : current.title}</h3>
            <p>{ar ? current.descriptionAr : current.description}</p>
            <ul>
              {points.map((point) => (
                <li key={point}><CheckCircle2 size={18} /><span>{point}</span></li>
              ))}
            </ul>
            <Link className="atlas-link" href={`/${locale}/services/${current.slug}`}>
              {ar ? 'تفاصيل الخدمة' : 'View this service'}
              <ArrowRight size={16} className={ar ? 'reverse-arrow' : ''} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
