'use client';

import Image from 'next/image';
import {ActionButton} from '@/components/ActionButton';

export default function ProjectsEnquiryCta({locale, image}) {
  const ar = locale === 'ar';
  return (
    <section className="asas-cta-band pl-cta">
      <div className="pl-cta-media" aria-hidden="true">
        {image?.src && (
          <Image src={image.src} alt="" fill sizes="100vw" style={{objectPosition: image.crop || '50% 40%'}} />
        )}
      </div>
      <div className="pl-cta-veil" aria-hidden="true" />
      <div className="pl-cta-inner">
        <div className="pl-cta-copy">
          <p className="pl-kicker light">
            <i />
            {ar ? 'ابدأ محادثة' : 'Start a Conversation'}
          </p>
          <h2>{ar ? 'هل تخطط لمشروع جديد؟' : 'Planning a New Project?'}</h2>
          <p>
            {ar
              ? 'فريقنا الهندسي جاهز لفهم متطلباتك والمساعدة في تحويل رؤيتك إلى واقع.'
              : 'Our engineering team is ready to understand your requirements and help turn your vision into reality.'}
          </p>
          <ActionButton variant="primary" href={`/${locale}/project-enquiry`} icon="arrow-up">
            {ar ? 'أرسل استفسار مشروع' : 'Submit a Project Enquiry'}
          </ActionButton>
        </div>
        <ul className="pl-cta-words" aria-hidden="true">
          <li>{ar ? 'أشخاص' : 'People'}</li>
          <li>{ar ? 'أفكار' : 'Ideas'}</li>
          <li>{ar ? 'هندسة' : 'Engineering'}</li>
          <li>{ar ? 'أثر' : 'Impact'}</li>
        </ul>
      </div>
    </section>
  );
}
