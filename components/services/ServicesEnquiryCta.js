'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';

export default function ServicesEnquiryCta({locale, image}) {
  const ar = locale === 'ar';
  return (
    <section className="sv-cta">
      <div className="sv-cta-media" aria-hidden="true">
        {image && <Image src={image} alt="" fill sizes="100vw" />}
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
          <Link className="sv-cta-btn" href={`/${locale}/project-enquiry`}>
            {ar ? 'أرسل استفسار مشروع' : 'Submit a Project Enquiry'}
            <ArrowUpRight size={16} className={ar ? 'reverse-arrow' : ''} />
          </Link>
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
