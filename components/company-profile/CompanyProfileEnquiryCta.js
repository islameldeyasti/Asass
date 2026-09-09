'use client';

import Image from 'next/image';
import {ActionButton} from '@/components/ActionButton';

export default function CompanyProfileEnquiryCta({locale, image}) {
  const ar = locale === 'ar';
  const src = typeof image === 'string' ? image : image?.src;
  const crop = typeof image === 'object' && image?.crop ? image.crop : '50% 40%';
  return (
    <section className="asas-cta-band cp-cta" id="contact">
      <div className="cp-cta-media" aria-hidden="true">
        {src ? (
          <Image src={src} alt="" fill sizes="100vw" style={{objectFit: 'cover', objectPosition: crop}} />
        ) : null}
      </div>
      <div className="cp-cta-veil" aria-hidden="true" />
      <div className="cp-shell cp-cta-inner">
        <div className="cp-cta-copy">
          <p className="cp-kicker light">
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
        <ul className="cp-cta-words" aria-hidden="true">
          {(ar
            ? ['أشخاص', 'أماكن', 'إمكانات', 'غدٍ أفضل']
            : ['People', 'Places', 'Possibilities', 'A Better', 'Tomorrow']
          ).map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
