import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {ActionButton} from '@/components/ActionButton';

export function Container({children, className = ''}) {
  return <div className={`container ${className}`}>{children}</div>;
}

export function Eyebrow({children}) {
  return (
    <p className="eyebrow">
      <i /> {children}
    </p>
  );
}

export function SectionTitle({eyebrow, title, copy}) {
  return (
    <div className="section-title">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2>{title}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}

export function ArrowLink({href, children, locale}) {
  const ar = locale === 'ar';
  return (
    <Link className="arrow-link" href={href}>
      {children}
      <ArrowUpRight size={18} className={ar ? 'reverse-arrow' : undefined} aria-hidden="true" />
    </Link>
  );
}

export function CTA({locale, title = 'Planning a New Project?'}) {
  const ar = locale === 'ar';
  return (
    <section className="project-cta">
      <Container>
        <Eyebrow>{ar ? 'ابدأ محادثة' : 'START A CONVERSATION'}</Eyebrow>
        <h2>{ar ? 'هل تخطط لمشروع جديد؟' : title}</h2>
        <p>
          {ar
            ? 'فريقنا الهندسي جاهز لفهم متطلبات مشروعك.'
            : 'Our engineering team is ready to understand your requirements.'}
        </p>
        <ActionButton variant="light" href={`/${locale}/project-enquiry`} icon="arrow-up">
          {ar ? 'أرسل استفسار مشروع' : 'Submit a Project Enquiry'}
        </ActionButton>
      </Container>
    </section>
  );
}
