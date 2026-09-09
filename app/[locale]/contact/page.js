import Link from 'next/link';
import Image from 'next/image';
import {ArrowRight, FileText, Mail, MessageCircle, Phone, Printer} from 'lucide-react';
import {Container} from '@/components/UI';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import EnquiryForm from '@/components/EnquiryForm';
import OfficeMap from '@/components/OfficeMap';
import {company} from '@/data/company';
import {roleImages} from '@/data/image-manifest';

function NextArrow({ar}) {
  return <ArrowRight size={16} className={ar ? 'reverse-arrow' : ''} />;
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  return {
    title: locale === 'ar' ? 'تواصل مع أساس للاستشارات الهندسية وإدارة المشاريع | أبوظبي' : 'Contact ASAS | Abu Dhabi',
    description: locale === 'ar' ? company.addressAr : company.address,
  };
}

export default async function Contact({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero-photo" aria-hidden="true">
          <Image
            src={roleImages.CONTACT_HERO}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <Container>
          <span className="breadcrumb">{ar ? 'أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS'} / {ar ? 'تواصل' : 'Contact'}</span>
          <h1>{ar ? 'تواصل مع مكتب أساس للاستشارات الهندسية وإدارة المشاريع في أبوظبي.' : 'Reach the ASAS office in Abu Dhabi.'}</h1>
          <p>
            {ar
              ? 'بيانات المكتب وخريطة الموقع ونموذج استفسار المشروع في صفحة واحدةحدة.'
              : 'Office details, location map and a project enquiry form — all on one page.'}
          </p>
          <div className="contact-hero-meta">
            <span>
              {ar ? company.cityAr : company.city} · {company.year}
            </span>
            <a href={`mailto:${company.email}`}>{company.email}</a>
            <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
          </div>
        </Container>
      </section>

      <section className="contact-body">
        <Container className="contact-layout">
          <aside className="contact-aside">
            <p className="atlas-kicker">{ar ? 'المكتب' : 'Abu Dhabi office'}</p>
            <h2>{ar ? 'بيانات التواصل' : 'Contact details'}</h2>
            <p>
              {ar
                ? 'تأسست أساس للاستشارات الهندسية وإدارة المشاريع في أبوظبي عام 2009. يمكنك الاتصال مباشرة أو إرسال استفسار عبر النموذج.'
                : 'Founded in Abu Dhabi in 2009. Call or message directly, or send an enquiry with the form.'}
            </p>

            <div className="contact-list">
              <div>
                <b>{ar ? 'المكتب' : 'Office'}</b>
                <span>{ar ? company.addressAr : company.address}</span>
              </div>
              <div>
                <b>{ar ? 'الهاتف' : 'Telephone'}</b>
                <a href={`tel:${company.phone.replace(/\s/g, '')}`} dir="ltr">
                  <Phone size={15} aria-hidden="true" />
                  {company.phone}
                </a>
              </div>
              <div>
                <b>{ar ? 'الهاتف المتحرك / واتساب' : 'Mobile / WhatsApp'}</b>
                <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noopener noreferrer" dir="ltr">
                  <MessageCircle size={15} aria-hidden="true" />
                  {company.mobile}
                </a>
              </div>
              <div>
                <b>{ar ? 'الفاكس' : 'Fax'}</b>
                <a href={`tel:${company.fax.replace(/\s/g, '')}`} dir="ltr">
                  <Printer size={15} aria-hidden="true" />
                  {company.fax}
                </a>
              </div>
              <div>
                <b>{ar ? 'البريد الإلكتروني' : 'Email'}</b>
                <a href={`mailto:${company.email}`} dir="ltr">
                  <Mail size={15} aria-hidden="true" />
                  {company.email}
                </a>
              </div>
              <div>
                <b>{ar ? 'الموقع الإلكتروني' : 'Website'}</b>
                <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer">
                  {company.website}
                </a>
              </div>
            </div>

            <div className="contact-note-card">
              <FileText size={18} aria-hidden="true" />
              <div>
                <strong>{ar ? 'الملف التعريفي' : 'Company profile'}</strong>
                <p>
                  {ar
                    ? 'حمّل الملف الرسمي للاطلاع على القدرات والمشاريع قبل التواصل.'
                    : 'Download the official profile for capabilities and projects before you write.'}
                </p>
                <ActionButton variant="outline" href={`/${locale}/downloads`} icon="file">
                  {ar ? 'صفحة التحميلات' : 'Downloads page'}
                </ActionButton>
              </div>
            </div>
          </aside>

          <div className="contact-form-panel">
            <header className="contact-form-head">
              <p className="atlas-kicker">{ar ? 'النموذج' : 'Enquiry form'}</p>
              <h2>{ar ? 'استفسار مشروع' : 'Project enquiry'}</h2>
              <p>
                {ar
                  ? 'شاركنا المعلومات الأساسية عن مشروعك وسيتواصل معك فريق أساس للاستشارات الهندسية وإدارة المشاريع.'
                  : 'Share the essentials about your project and the ASAS team will follow up.'}
              </p>
            </header>
            <EnquiryForm locale={locale} id="contact-enquiry-form" />
          </div>
        </Container>
      </section>

      <section className="contact-map-wrap">
        <Container>
          <OfficeMap locale={locale} />
        </Container>
      </section>

      <section className="contact-cta asas-cta-band">
        <div className="contact-cta-veil" aria-hidden="true" />
        <Container className="contact-cta-inner">
          <div className="contact-cta-copy">
            <p className="contact-cta-kicker">
              <i />
              {ar ? 'استكشف' : 'Explore'}
            </p>
            <h2>{ar ? 'راجع الخدمات أو المشاريع أولاً' : 'Review services or projects first'}</h2>
            <p>
              {ar
                ? 'إذا كنت لا تزال تستكشف النطاق، ابدأ من صفحات الخدمات أو المشاريع.'
                : 'If you are still exploring scope, start from the services or projects pages.'}
            </p>
            <ActionGroup className="contact-cta-actions">
              <ActionButton variant="primary" href={`/${locale}/services`}>
                {ar ? 'الخدمات' : 'Services'}
              </ActionButton>
              <ActionButton variant="ghost" href={`/${locale}/projects`}>
                {ar ? 'المشاريع' : 'Projects'}
              </ActionButton>
            </ActionGroup>
          </div>
          <ul className="contact-cta-words" aria-hidden="true">
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
