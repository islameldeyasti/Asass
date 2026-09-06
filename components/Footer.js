'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useRef} from 'react';
import {motion, useInView, useReducedMotion} from 'motion/react';
import {ArrowRight, Mail, MapPin, MessageCircle, Phone} from 'lucide-react';
import {company} from '@/data/company';
import {services} from '@/data/services';

const EASE = [0.16, 1, 0.3, 1];

const companyLinks = [
  ['About', 'عن أساس', 'about'],
  ['Projects', 'المشاريع', 'projects'],
  ['Portfolio', 'المحفظة', 'portfolio'],
  ['Team', 'فريقنا', 'team'],
  ['Sectors', 'القطاعات', 'sectors'],
  ['Careers', 'الوظائف', 'careers'],
  ['Downloads', 'التحميلات', 'downloads'],
  ['Contact', 'تواصل', 'contact'],
  ['Project Enquiry', 'استفسار مشروع', 'project-enquiry'],
];

export default function Footer({locale}) {
  const ar = locale === 'ar';
  const reduced = useReducedMotion();
  const rootRef = useRef(null);
  const inView = useInView(rootRef, {once: true, amount: 0.18});
  const footerServices = services.filter((service) => service.featured).slice(0, 7);
  const show = inView || reduced;

  const reveal = (delay = 0) =>
    reduced
      ? {}
      : {
          initial: {opacity: 0, y: 22},
          animate: show ? {opacity: 1, y: 0} : {opacity: 0, y: 22},
          transition: {duration: 0.6, delay, ease: EASE},
        };

  return (
    <footer ref={rootRef} className="site-footer asas-footer">
      <div className="asas-footer-shell">
        <div className="footer-grid">
          <motion.div className="footer-brand" {...reveal(0)}>
            <Link className="footer-logo" href={`/${locale}`} aria-label="ASAS home">
              <Image
                src="/brand/asas-mark-header.png"
                alt="ASAS Engineering & Project Management Consultancy"
                width={168}
                height={168}
                priority={false}
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
          </motion.div>

          <motion.nav
            className="footer-column footer-services"
            aria-label={ar ? 'الخدمات' : 'Services'}
            {...reveal(0.08)}
          >
            <h3>{ar ? 'الخدمات' : 'Services'}</h3>
            {footerServices.map((service) => (
              <Link href={`/${locale}/services/${service.slug}`} key={service.slug}>
                {ar ? service.titleAr : service.title}
              </Link>
            ))}
          </motion.nav>

          <motion.nav
            className="footer-column footer-company"
            aria-label={ar ? 'الشركة' : 'Company'}
            {...reveal(0.16)}
          >
            <h3>{ar ? 'الشركة' : 'Company'}</h3>
            {companyLinks.map(([label, labelAr, path]) => (
              <Link href={`/${locale}/${path}`} key={path}>
                {ar ? labelAr : label}
              </Link>
            ))}
          </motion.nav>

          <motion.div className="footer-column footer-contact" {...reveal(0.24)}>
            <h3>{ar ? 'تواصل معنا' : 'Contact'}</h3>
            <div className="footer-contact-item">
              <MapPin aria-hidden="true" strokeWidth={1.75} />
              <div>
                <strong>{ar ? 'مكتب أبوظبي' : 'Abu Dhabi office'}</strong>
                <p>{ar ? company.addressAr : company.address}</p>
              </div>
            </div>
            <div className="footer-contact-item">
              <Phone aria-hidden="true" strokeWidth={1.75} />
              <div>
                <strong>{ar ? 'اتصل بنا' : 'Call us'}</strong>
                <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
              </div>
            </div>
            <div className="footer-contact-item">
              <MessageCircle aria-hidden="true" strokeWidth={1.75} />
              <div>
                <strong>WhatsApp</strong>
                <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">
                  {ar ? 'تواصل مع ASAS' : 'Message ASAS'}
                </a>
              </div>
            </div>
            <div className="footer-contact-item">
              <Mail aria-hidden="true" strokeWidth={1.75} />
              <div>
                <strong>{ar ? 'البريد الإلكتروني' : 'Email'}</strong>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div className="footer-action" {...reveal(0.32)}>
          <div className="footer-action-copy">
            <span className="footer-action-eyebrow">{ar ? 'هل أنت مستعد للبدء؟' : 'Ready to start?'}</span>
            <strong className="footer-action-title">
              {ar ? 'ابدأ مشروعك التالي مع ASAS.' : 'Start your next project with ASAS.'}
            </strong>
            <p>
              {ar
                ? 'شاركنا متطلبات مشروعك وسنرشدك إلى الخطوة التالية.'
                : 'Share your project requirements and our team will guide you through the next step.'}
            </p>
          </div>
          <Link className="footer-action-link" href={`/${locale}/project-enquiry`}>
            {ar ? 'استفسار مشروع' : 'Project Enquiry'}
            <ArrowRight size={18} className={ar ? 'reverse-arrow' : ''} />
          </Link>
        </motion.div>

        <motion.div className="footnote" {...reveal(0.4)}>
          <span>© {new Date().getFullYear()} ASAS Engineering &amp; Project Management Consultancy</span>
          <span className="footer-legal">
            <Link href={`/${locale}/privacy`}>{ar ? 'الخصوصية' : 'Privacy Policy'}</Link>
            <i aria-hidden="true">·</i>
            <Link href={`/${locale}/terms`}>{ar ? 'الشروط' : 'Terms'}</Link>
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
