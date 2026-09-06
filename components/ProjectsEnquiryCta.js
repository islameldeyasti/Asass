'use client';

import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';

export default function ProjectsEnquiryCta({locale, image}) {
  const ar = locale === 'ar';
  return (
    <section className="pl-cta">
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
          <Link className="pl-cta-btn" href={`/${locale}/project-enquiry`}>
            {ar ? 'أرسل استفسار مشروع' : 'Submit a Project Enquiry'}
            <ArrowUpRight size={16} className={ar ? 'reverse-arrow' : ''} />
          </Link>
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
