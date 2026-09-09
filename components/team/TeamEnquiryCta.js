'use client';

import Image from 'next/image';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import {company} from '@/data/company';
import {t} from '@/lib/i18n';

export default function TeamEnquiryCta({locale, image}) {
  const ar = locale === 'ar';
  const src = typeof image === 'string' ? image : image?.src;
  const crop = typeof image === 'object' && image?.crop ? image.crop : '50% 35%';

  return (
    <section className="tm-cta asas-cta-band">
      <div className="tm-cta-media" aria-hidden="true">
        {src ? (
          <Image src={src} alt="" fill sizes="100vw" style={{objectFit: 'cover', objectPosition: crop}} />
        ) : null}
      </div>
      <div className="tm-cta-veil" aria-hidden="true" />
      <div className="tm-shell tm-cta-inner">
        <div>
          <p className="tm-kicker light">
            <i />
            {ar ? 'ابدأ محادثة' : 'Start a Conversation'}
          </p>
          <h2>{ar ? 'هل لديك مشروع في بالك؟' : 'Have a project in mind?'}</h2>
          <p>
            {ar
              ? 'فريقنا جاهز لمناقشة متطلباتك ومساعدتك في الخطوات التالية.'
              : 'Our team is ready to discuss your requirements and help with the next steps.'}
          </p>
        </div>
        <ActionGroup className="tm-cta-actions" stack={false}>
          <ActionButton variant="primary" href={`/${locale}/project-enquiry`} icon="arrow-up">
            {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
          </ActionButton>
          <ActionButton
            variant="ghost"
            href={`https://wa.me/${company.whatsapp}`}
            external
            icon={false}
          >
            {t('whatsapp', locale)}
          </ActionButton>
        </ActionGroup>
      </div>
    </section>
  );
}
