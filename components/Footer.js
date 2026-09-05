import Image from 'next/image';
import Link from 'next/link';
import {ArrowUpRight, Mail, MapPin, MessageCircle, Phone} from 'lucide-react';
import {company} from '@/data/company';
import {services} from '@/data/services';

export default function Footer({locale}) {
  const ar = locale === 'ar';
  const footerServices = services.filter((service) => service.featured).slice(0, 7);

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link className="footer-logo" href={`/${locale}`} aria-label="ASAS home">
            <Image
              src="/brand/asas-mark-reverse.png"
              alt="ASAS Engineering & Project Management Consultancy"
              width={96}
              height={96}
            />
          </Link>
          <p className="footer-company-name">
            ASAS Engineering &amp; Project Management Consultancy
          </p>
          <p className="footer-description">{ar ? company.descriptionAr : company.description}</p>
          <div className="footer-credentials">
            <span>{ar ? 'تأسست عام 2009' : 'Established 2009'}</span>
            <span>{ar ? 'أبوظبي، الإمارات' : 'Abu Dhabi, UAE'}</span>
            <span>{ar ? 'إحدى مبادرات مجموعة مير' : 'An initiative of Mir Group'}</span>
          </div>
        </div>

        <nav className="footer-column footer-services" aria-label={ar ? 'الخدمات' : 'Services'}>
          <h3>{ar ? 'الخدمات' : 'Services'}</h3>
          {footerServices.map((service) => (
            <Link href={`/${locale}/services/${service.slug}`} key={service.slug}>
              {ar ? service.titleAr : service.title}
            </Link>
          ))}
        </nav>

        <nav className="footer-column" aria-label={ar ? 'الشركة' : 'Company'}>
          <h3>{ar ? 'الشركة' : 'Company'}</h3>
          {[
            ['About', 'عن أساس', 'about'],
            ['Projects', 'المشاريع', 'projects'],
            ['Sectors', 'القطاعات', 'sectors'],
            ['Careers', 'الوظائف', 'careers'],
            ['Downloads', 'التحميلات', 'downloads'],
            ['Contact', 'تواصل', 'contact'],
          ].map(([label, labelAr, path]) => (
            <Link href={`/${locale}/${path}`} key={path}>{ar ? labelAr : label}</Link>
          ))}
          <Link href={`/${locale}/project-enquiry`}>
            {ar ? 'استفسار مشروع' : 'Project Enquiry'}
          </Link>
        </nav>

        <div className="footer-column footer-contact">
          <h3>{ar ? 'تواصل معنا' : 'Contact'}</h3>
          <div className="footer-contact-item">
            <MapPin aria-hidden="true" />
            <div>
              <strong>{ar ? 'المكتب' : 'Abu Dhabi office'}</strong>
              <p>{ar ? company.addressAr : company.address}</p>
            </div>
          </div>
          <div className="footer-contact-item">
            <Phone aria-hidden="true" />
            <div>
              <strong>{ar ? 'اتصل بنا' : 'Call us'}</strong>
              <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
            </div>
          </div>
          <div className="footer-contact-item">
            <MessageCircle aria-hidden="true" />
            <div>
              <strong>WhatsApp</strong>
              <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">
                {ar ? 'تواصل مع ASAS' : 'Message ASAS'}
              </a>
            </div>
          </div>
          <div className="footer-contact-item">
            <Mail aria-hidden="true" />
            <div>
              <strong>{ar ? 'البريد الإلكتروني' : 'Email'}</strong>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-action">
        <div>
          <span>{ar ? 'ابدأ مشروعك' : 'Start your project'}</span>
          <p>{ar ? 'شاركنا متطلبات مشروعك وسنرشدك إلى الخطوة التالية.' : 'Share your project requirements and our team will guide the next step.'}</p>
        </div>
        <Link className="footer-action-link" href={`/${locale}/project-enquiry`}>
          {ar ? 'أرسل استفساراً' : 'Project enquiry'}
          <ArrowUpRight size={16} />
        </Link>
      </div>

      <div className="footnote">
        <span>© {new Date().getFullYear()} ASAS Engineering &amp; Project Management Consultancy</span>
        <span className="footer-legal">
          <Link href={`/${locale}/privacy`}>{ar ? 'الخصوصية' : 'Privacy Policy'}</Link>
          <i aria-hidden="true">·</i>
          <Link href={`/${locale}/terms`}>{ar ? 'الشروط' : 'Terms'}</Link>
        </span>
      </div>
    </footer>
  );
}
