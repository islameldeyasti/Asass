import Link from 'next/link';
import Image from 'next/image';
import {ArrowRight, Clock3, FileText, Mail, MessageCircle, Phone} from 'lucide-react';
import {Container} from '@/components/UI';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import EnquiryForm from '@/components/EnquiryForm';
import {company} from '@/data/company';
import {roleImages} from '@/data/image-manifest';

const steps = [
  {
    n: '01',
    title: 'Share the brief',
    titleAr: 'شارك الموجز',
    copy: 'Tell us about the project type, location and the service you need.',
    copyAr: 'أخبرنا بنوع المشروع والموقع والخدمة التي تحتاجها.',
  },
  {
    n: '02',
    title: 'Office review',
    titleAr: 'مراجعة المكتب',
    copy: 'The ASAS team reviews the enquiry against capability and capacity.',
    copyAr: 'يراجع فريق أساس للاستشارات الهندسية وإدارة المشاريع الاستفسار وفق القدرة والسعة.',
  },
  {
    n: '03',
    title: 'Follow-up',
    titleAr: 'المتابعة',
    copy: 'We respond with next steps or clarifying questions.',
    copyAr: 'نرد بالخطوات التالية أو بأسئلة للتوضيح.',
  },
];

function NextArrow({ar}) {
  return <ArrowRight size={16} className={ar ? 'reverse-arrow' : ''} />;
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  return {
    title: locale === 'ar' ? 'استفسار مشروع | أساس للاستشارات الهندسية وإدارة المشاريع' : 'Project Enquiry | ASAS',
    description:
      locale === 'ar'
        ? 'أرسل استفسار مشروع إلى مكتب أساس للاستشارات الهندسية وإدارة المشاريع في أبوظبي.'
        : 'Send a project enquiry to the ASAS office in Abu Dhabi.',
  };
}

export default async function Enquiry({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';

  return (
    <div className="enquiry-page">
      <section className="enquiry-hero">
        <div className="enquiry-hero-photo" aria-hidden="true">
          <Image
            src={roleImages.ENQUIRY_HERO}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <Container>
          <span className="breadcrumb">{ar ? 'أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS'} / {ar ? 'استفسار مشروع' : 'Project Enquiry'}</span>
          <h1>{ar ? 'ابدأ مشروعك مع أساس للاستشارات الهندسية وإدارة المشاريع.' : 'Start your project with ASAS.'}</h1>
          <p>
            {ar
              ? 'شارك المعلومات الأساسية عن المشروع لبدء المحادثة مع فريق المكتب في أبوظبي.'
              : 'Share the essential project information to begin a conversation with the Abu Dhabi office team.'}
          </p>
          <div className="enquiry-hero-meta">
            <span>{ar ? company.cityAr : company.city} · {company.year}</span>
            <a href={`mailto:${company.email}`}>{company.email}</a>
            <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
          </div>
        </Container>
      </section>

      <section className="enquiry-body">
        <Container className="enquiry-layout">
          <aside className="enquiry-aside">
            <p className="atlas-kicker">{ar ? 'كيف يعمل' : 'How it works'}</p>
            <h2>{ar ? 'من الاستفسار إلى المتابعة' : 'From enquiry to follow-up'}</h2>
            <p>
              {ar
                ? 'النموذج يجهّز رسالة إلى بريد المكتب. يمكنك أيضاً التواصل مباشرة عبر الهاتف أو واتساب.'
                : 'The form prepares a message for the office email. You can also reach us directly by phone or WhatsApp.'}
            </p>

            <ol className="enquiry-steps">
              {steps.map((step) => (
                <li key={step.n}>
                  <span>{step.n}</span>
                  <div>
                    <h3>{ar ? step.titleAr : step.title}</h3>
                    <p>{ar ? step.copyAr : step.copy}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="enquiry-direct">
              <h3>{ar ? 'تواصل مباشر' : 'Direct contact'}</h3>
              <a href={`tel:${company.phone.replace(/\s/g, '')}`}>
                <Phone size={16} aria-hidden="true" />
                {company.phone}
              </a>
              <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={16} aria-hidden="true" />
                {ar ? 'واتساب' : 'WhatsApp'}
              </a>
              <a href={`mailto:${company.email}`}>
                <Mail size={16} aria-hidden="true" />
                {company.email}
              </a>
              <Link href={`/${locale}/contact`}>
                <Clock3 size={16} aria-hidden="true" />
                {ar ? 'صفحة التواصل والخريطة' : 'Contact page & map'}
                <NextArrow ar={ar} />
              </Link>
            </div>

            <div className="enquiry-note-card">
              <FileText size={18} aria-hidden="true" />
              <div>
                <strong>{ar ? 'الملف التعريفي' : 'Company profile'}</strong>
                <p>
                  {ar
                    ? 'حمّل الملف الرسمي قبل أو بعد إرسال الاستفسار.'
                    : 'Download the official profile before or after sending your enquiry.'}
                </p>
                <ActionButton variant="outline" href={`/${locale}/downloads`} icon="file">
                  {ar ? 'صفحة التحميلات' : 'Downloads page'}
                </ActionButton>
              </div>
            </div>
          </aside>

          <div className="enquiry-form-panel">
            <header className="enquiry-form-head">
              <p className="atlas-kicker">{ar ? 'النموذج' : 'Enquiry form'}</p>
              <h2>{ar ? 'أرسل استفسار مشروع' : 'Submit a project enquiry'}</h2>
              <p>
                {ar
                  ? 'املأ الحقول أدناه وسنفتح رسالة جاهزة إلى فريق أساس للاستشارات الهندسية وإدارة المشاريع.'
                  : 'Complete the fields below and we will open a ready message to the ASAS team.'}
              </p>
            </header>
            <EnquiryForm locale={locale} id="standalone-enquiry-form" />
          </div>
        </Container>
      </section>

      <section className="enquiry-cta asas-cta-band">
        <div className="enquiry-cta-veil" aria-hidden="true" />
        <Container className="enquiry-cta-inner">
          <div className="enquiry-cta-copy">
            <p className="enquiry-cta-kicker">
              <i />
              {ar ? 'بديل' : 'Prefer another route?'}
            </p>
            <h2>{ar ? 'راجع الخدمات أو المشاريع أولاً' : 'Review services or projects first'}</h2>
            <p>
              {ar
                ? 'إذا كنت لا تزال تستكشف النطاق، يمكنك البدء من صفحات الخدمات أو المشاريع.'
                : 'If you are still exploring scope, start from the services or projects pages.'}
            </p>
            <ActionGroup className="enquiry-cta-actions">
              <ActionButton variant="primary" href={`/${locale}/services`}>
                {ar ? 'الخدمات' : 'Services'}
              </ActionButton>
              <ActionButton variant="ghost" href={`/${locale}/projects`}>
                {ar ? 'المشاريع' : 'Projects'}
              </ActionButton>
            </ActionGroup>
          </div>
          <ul className="enquiry-cta-words" aria-hidden="true">
            <li>{ar ? 'أشخاص' : 'People'}</li>
            <li>{ar ? 'أماكن' : 'Places'}</li>
            <li>{ar ? 'إمكانات' : 'Possibilities'}</li>
            <li>{ar ? 'غدٍ أفضل' : 'A Better Tomorrow'}</li>
          </ul>
        </Container>
      </section>
    </div>
  );
}
