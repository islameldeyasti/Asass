'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';

export default function SectorDetailEnquiryCta({locale, image, title}) {
  const ar = locale === 'ar';
  return (
    <section className="sc-cta">
      <div className="sc-cta-media" aria-hidden="true">
        {image && <Image src={image} alt="" fill sizes="100vw" />}
      </div>
      <div className="sc-cta-veil" aria-hidden="true" />
      <div className="sc-shell sc-cta-inner">
        <div className="sc-cta-copy">
          <p className="sc-kicker light">
            <i />
            {ar ? 'ابدأ محادثة' : 'Start a Conversation'}
          </p>
          <h2>{title}</h2>
          <p>
            {ar
              ? 'فريقنا الهندسي جاهز لفهم متطلباتك والمساعدة في تحويل رؤيتك إلى واقع.'
              : 'Our engineering team is ready to understand your requirements and help turn your vision into reality.'}
          </p>
          <Link className="sc-cta-btn" href={`/${locale}/project-enquiry`}>
            {ar ? 'أرسل استفسار مشروع' : 'Submit a Project Enquiry'}
            <ArrowUpRight size={16} className={ar ? 'sc-flip' : ''} />
          </Link>
        </div>
        <ul className="sc-cta-words" aria-hidden="true">
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
