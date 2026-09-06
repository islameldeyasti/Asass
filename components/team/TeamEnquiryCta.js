import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight, MessageCircle} from 'lucide-react';
import {company} from '@/data/company';
import {generatedEditorialImages} from '@/data/image-manifest';

export default function TeamEnquiryCta({locale}) {
  const ar = locale === 'ar';
  const bg = generatedEditorialImages.siteSupervision || generatedEditorialImages.corporateTeam;

  return (
    <section className="tm-cta">
      {bg && (
        <div className="tm-cta-media" aria-hidden="true">
          <Image src={bg} alt="" fill sizes="100vw" style={{objectPosition: '50% 40%'}} />
        </div>
      )}
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
        <div className="tm-cta-actions">
          <Link className="tm-btn-light" href={`/${locale}/project-enquiry`}>
            {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
            <ArrowUpRight size={15} className={ar ? 'tm-flip' : ''} />
          </Link>
          <a
            className="tm-btn-ghost"
            href={`https://wa.me/${company.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
