import {notFound} from 'next/navigation';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsApp from '@/components/WhatsApp';
import ThemeFab from '@/components/theme/ThemeFab';
import FloatingUtilities from '@/components/FloatingUtilities';
import AIAssistantMount from '@/components/ai-assistant/AIAssistantMount';
import SiteMotion from '@/components/SiteMotion';
import AnchorScrollRoot from '@/components/AnchorScrollRoot';
import {company} from '@/data/company';
import {t} from '@/lib/i18n/ui';

export function generateStaticParams() {
  return [{locale: 'en'}, {locale: 'ar'}];
}

export default async function LocaleLayout({children, params}) {
  const {locale} = await params;
  if (!['en', 'ar'].includes(locale)) notFound();
  const ar = locale === 'ar';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: company.name,
    foundingDate: company.year,
    email: company.email,
    telephone: company.phone,
    url: `https://${company.website}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress:
        'ADCP Building No. P1239, Plot No. C125, Musaffah East 9, behind Safeer Mall, Mezzanine Floor, Office 3',
      postOfficeBoxNumber: '114789',
      addressLocality: 'Abu Dhabi',
      addressCountry: 'AE',
    },
  };

  return (
    <div dir={ar ? 'rtl' : 'ltr'} lang={locale} data-locale={locale}>
      {/* lang/dir set in root <head> boot + SiteMotion; no raw <script> here */}
      <Script
        id="asas-org-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
      />
      <a className="skip" href="#main">
        {t('skipToContent', locale)}
      </a>
      <Header locale={locale} />
      <AnchorScrollRoot />
      <SiteMotion locale={locale} />
      <main id="main">{children}</main>
      <Footer locale={locale} />
      <FloatingUtilities locale={locale} />
      <ThemeFab locale={locale} />
      {/* Legacy text-only Chatbot kept in codebase but hidden — AI Assistant replaces it */}
      <AIAssistantMount locale={locale} />
      <WhatsApp locale={locale} />
    </div>
  );
}
