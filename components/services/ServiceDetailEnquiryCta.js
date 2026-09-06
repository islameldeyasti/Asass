'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';

export default function ServiceDetailEnquiryCta({locale, image}) {
  const ar = locale === 'ar';
  return (
    <section className="sd-cta">
      <div className="sd-cta-media" aria-hidden="true">
        {image && <Image src={image} alt="" fill sizes="100vw" />}
      </div>
      <div className="sd-cta-veil" aria-hidden="true" />
      <div className="sd-shell sd-cta-inner">
        <div className="sd-cta-copy">
          <p className="sd-kicker light">
            <i />
            {ar ? 'ابدأ محادثة' : 'Start a Conversation'}
          </p>
          <h2>{ar ? 'هل تخطط لمشروع جديد؟' : 'Planning a New Project?'}</h2>
          <p>
            {ar
              ? 'فريقنا الهندسي جاهز لفهم متطلباتك والمساعدة في تحويل رؤيتك إلى واقع.'
              : 'Our engineering team is ready to understand your requirements and help turn your vision into reality.'}
          </p>
          <Link className="sd-cta-btn" href={`/${locale}/project-enquiry`}>
            {ar ? 'أرسل استفسار مشروع' : 'Submit a Project Enquiry'}
            <ArrowUpRight size={16} className={ar ? 'sd-flip' : ''} />
          </Link>
        </div>
        <ul className="sd-cta-words" aria-hidden="true">
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
