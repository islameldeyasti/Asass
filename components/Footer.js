'use client';

import Link from 'next/link';
import {useRef} from 'react';
import {motion, useInView, useReducedMotion} from 'motion/react';
import {ArrowRight, Mail, MapPin, MessageCircle, Phone} from 'lucide-react';
import {company} from '@/data/company';
import {services} from '@/data/services';
import ThemeLogo from '@/components/theme/ThemeLogo';
import SocialIconLinks from '@/components/social/SocialIconLinks';
import {t, tNav} from '@/lib/i18n/ui';

const EASE = [0.16, 1, 0.3, 1];

const companyLinkKeys = [
  ['About', 'about'],
  ['Projects', 'projects'],
  ['Gallery', 'gallery'],
  ['Portfolio', 'portfolio'],
  ['Team', 'team'],
  ['Sectors', 'sectors'],
  ['Blog', 'blog'],
  ['Careers', 'careers'],
  ['Downloads', 'downloads'],
  ['Contact', 'contact'],
  ['Project Enquiry', 'project-enquiry'],
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
            <Link className="footer-logo" href={`/${locale}`} aria-label={t('homeAria', locale)}>
              <ThemeLogo
                appearance="auto"
                alt={ar ? company.nameAr : company.name}
                width={62}
                height={62}
              />
            </Link>
            <p className="footer-company-name">{ar ? company.nameAr : company.name}</p>
            <p className="footer-description">{ar ? company.descriptionAr : company.description}</p>
            <div className="footer-credentials">
              <span>{t('established2009', locale)}</span>
              <span>{t('abuDhabiUae', locale)}</span>
              <span>{t('mirGroup', locale)}</span>
            </div>
            <div className="footer-social">
              <p className="footer-social-label">{t('followAsas', locale)}</p>
              <nav aria-label={ar ? 'وسائل التواصل الاجتماعي' : 'Social media'}>
                <SocialIconLinks variant="footer" locale={locale} />
              </nav>
            </div>
          </motion.div>

          <motion.nav
            className="footer-column footer-services"
            aria-label={t('services', locale)}
            {...reveal(0.08)}
          >
            <h3>{t('services', locale)}</h3>
            {footerServices.map((service) => (
              <Link href={`/${locale}/services/${service.slug}`} key={service.slug}>
                {ar ? service.titleAr : service.title}
              </Link>
            ))}
          </motion.nav>

          <motion.nav
            className="footer-column footer-company"
            aria-label={t('company', locale)}
            {...reveal(0.16)}
          >
            <h3>{t('company', locale)}</h3>
            {companyLinkKeys.map(([key, path]) => (
              <Link href={`/${locale}/${path}`} key={path}>
                {tNav(key, locale)}
              </Link>
            ))}
          </motion.nav>

          <motion.div className="footer-column footer-contact" {...reveal(0.24)}>
            <h3>{t('contactUs', locale)}</h3>
            <div className="footer-contact-item">
              <MapPin aria-hidden="true" strokeWidth={1.75} />
              <div>
                <strong>{t('abuDhabiOffice', locale)}</strong>
                <p>{ar ? company.addressAr : company.address}</p>
              </div>
            </div>
            <div className="footer-contact-item">
              <Phone aria-hidden="true" strokeWidth={1.75} />
              <div>
                <strong>{t('callUs', locale)}</strong>
                <a href={`tel:${company.phone.replace(/\s/g, '')}`} dir="ltr">
                  {company.phone}
                </a>
              </div>
            </div>
            <div className="footer-contact-item">
              <MessageCircle aria-hidden="true" strokeWidth={1.75} />
              <div>
                <strong>{t('whatsapp', locale)}</strong>
                <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer" dir="ltr">
                  {t('messageAsas', locale)}
                </a>
              </div>
            </div>
            <div className="footer-contact-item">
              <Mail aria-hidden="true" strokeWidth={1.75} />
              <div>
                <strong>{t('email', locale)}</strong>
                <a href={`mailto:${company.email}`} dir="ltr">
                  {company.email}
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div className="footer-action" {...reveal(0.32)}>
          <div className="footer-action-copy">
            <span className="footer-action-eyebrow">{t('readyToStart', locale)}</span>
            <strong className="footer-action-title">{t('startNextProject', locale)}</strong>
            <p>{t('shareRequirements', locale)}</p>
          </div>
          <Link className="footer-action-link" href={`/${locale}/project-enquiry`}>
            {t('projectEnquiry', locale)}
            <ArrowRight size={18} className={ar ? 'reverse-arrow' : ''} />
          </Link>
        </motion.div>

        <motion.div className="footnote" {...reveal(0.4)}>
          <span>
            © {new Date().getFullYear()}{' '}
            {ar ? company.nameAr : 'ASAS Engineering & Project Management Consultancy'}
          </span>
          <span className="footer-legal">
            <Link href={`/${locale}/privacy`}>{t('privacy', locale)}</Link>
            <i aria-hidden="true">·</i>
            <Link href={`/${locale}/terms`}>{t('terms', locale)}</Link>
          </span>
        </motion.div>
      </div>
    </footer>
  );
}
