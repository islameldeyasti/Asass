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
import {t} from '@/lib/i18n/ui';
import {
  getPublicCompany,
  getPublicFooter,
  getPublicNavigation,
  getPublicServices,
  getPublicSettings,
} from '@/lib/cms/public-data';
import {normalizeBranding} from '@/lib/cms/branding';
import {getSeoSettings} from '@/lib/cms/seo-store';
import {buildOrganizationJsonLd, buildWebSiteJsonLd} from '@/lib/cms/seo/schema-builders';

export function generateStaticParams() {
  return [{locale: 'en'}, {locale: 'ar'}];
}

export default async function LocaleLayout({children, params}) {
  const {locale} = await params;
  if (!['en', 'ar'].includes(locale)) notFound();
  const ar = locale === 'ar';

  const [company, navItems, allServices, seoSettings, siteSettings, footerDoc] = await Promise.all([
    getPublicCompany(),
    getPublicNavigation(),
    getPublicServices(),
    getSeoSettings(),
    getPublicSettings(),
    getPublicFooter(),
  ]);

  const branding = normalizeBranding(siteSettings?.branding);
  const featuredServices = (allServices || []).filter((service) => service.featured).slice(0, 7);
  const social = siteSettings?.socialLinks || {};
  const sameAs = [social.linkedin, social.instagram, social.facebook, social.youtube].filter(Boolean);
  const footerLinks = footerDoc?.companyLinks;
  const footerCta = footerDoc?.cta;

  const schemas = [];
  if (seoSettings.organizationJsonLd !== false) {
    schemas.push(
      buildOrganizationJsonLd(
        {
          ...seoSettings,
          sameAs,
          defaultOgImage:
            seoSettings.defaultOgImage || branding.defaultOgImage || branding.primaryLogo,
        },
        company,
        branding,
      ),
      buildWebSiteJsonLd(seoSettings.canonicalBase || `https://${company.website}`),
    );
  }

  const gtmId = seoSettings.googleTagManagerId || '';
  const gaId = seoSettings.googleAnalyticsId || '';

  return (
    <div dir={ar ? 'rtl' : 'ltr'} lang={locale} data-locale={locale}>
      {schemas.map((schema, index) => (
        <Script
          key={`asas-schema-${index}`}
          id={`asas-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
        />
      ))}
      {gtmId ? (
        <Script id="asas-gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}</Script>
      ) : null}
      {gaId && !gtmId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="asas-ga" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}</Script>
        </>
      ) : null}
      <a className="skip" href="#main">
        {t('skipToContent', locale)}
      </a>
      <Header
        locale={locale}
        navItems={navItems || undefined}
        companyData={company}
        branding={branding}
      />
      <AnchorScrollRoot />
      <SiteMotion locale={locale} />
      <main id="main">{children}</main>
      <Footer
        locale={locale}
        companyData={company}
        featuredServices={featuredServices}
        companyLinks={footerLinks}
        footerCta={footerCta}
        branding={branding}
      />
      <FloatingUtilities locale={locale} />
      <ThemeFab locale={locale} />
      <AIAssistantMount locale={locale} />
      <WhatsApp locale={locale} companyData={company} />
    </div>
  );
}
