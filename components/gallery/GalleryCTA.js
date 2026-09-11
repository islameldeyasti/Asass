'use client';

import Image from 'next/image';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import {ctaBandImages} from '@/data/image-manifest';

export default function GalleryCTA({locale, ar}) {
  const bg = ctaBandImages.projects;

  return (
    <section className="gj-cta">
      <div className="gj-cta-media" aria-hidden="true">
        {bg ? (
          <Image
            src={bg}
            alt=""
            fill
            sizes="100vw"
            priority={false}
            style={{objectFit: 'cover', objectPosition: '50% 40%'}}
          />
        ) : null}
      </div>
      <div className="gj-cta-veil" aria-hidden="true" />
      <div className="gj-shell gj-cta-inner">
        <p className="gj-eyebrow">{ar ? 'الخطوة التالية' : 'Next Step'}</p>
        <h2>{ar ? 'استكشف مشاريعنا' : 'Explore Our Projects'}</h2>
        <p>
          {ar
            ? 'اكتشف النطاق الكامل لأعمال أساس في الهندسة والاستشارات.'
            : 'Discover the full scope of ASAS engineering and consultancy work.'}
        </p>
        <ActionGroup>
          <ActionButton variant="primary" href={`/${locale}/projects`} icon="arrow-up">
            {ar ? 'عرض كل المشاريع' : 'View All Projects'}
          </ActionButton>
          <ActionButton variant="outline" href={`/${locale}/project-enquiry`} icon="arrow-up">
            {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
          </ActionButton>
        </ActionGroup>
      </div>
    </section>
  );
}
