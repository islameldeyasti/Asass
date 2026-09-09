'use client';

import Image from 'next/image';
import {ActionButton} from '@/components/ActionButton';

export default function ServicesEnquiryCta({locale, image}) {
  const ar = locale === 'ar';
  const src = typeof image === 'string' ? image : image?.src;
  const crop = typeof image === 'object' && image?.crop ? image.crop : '50% 40%';

  return (
    <section className="sv-cta asas-cta-band">
      <div className="sv-cta-media" aria-hidden="true">
        {src ? (
          <Image src={src} alt="" fill sizes="100vw" style={{objectFit: 'cover', objectPosition: crop}} />
        ) : null}
      </div>
      <div className="sv-cta-veil" aria-hidden="true" />
      <div className="sv-shell sv-cta-inner">
        <div className="sv-cta-copy">
          <p className="sv-kicker light">
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
        <ul className="sv-cta-words" aria-hidden="true">
          <li>{ar ? 'أشخاص' : 'People'}</li>
          <li>{ar ? 'أماكن' : 'Places'}</li>
          <li>{ar ? 'إمكانات' : 'Possibilities'}</li>
          <li>{ar ? 'غدٍ' : 'A Better'}</li>
          <li>{ar ? 'أفضل' : 'Tomorrow'}</li>
        </ul>
      </div>
    </section>
  );
}
