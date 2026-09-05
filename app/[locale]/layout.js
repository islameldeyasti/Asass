import {notFound} from 'next/navigation';
import Header from '@/components/Header'; import Footer from '@/components/Footer'; import WhatsApp from '@/components/WhatsApp'; import SiteMotion from '@/components/SiteMotion';
import {company} from '@/data/company';
export function generateStaticParams(){return [{locale:'en'},{locale:'ar'}]}
export default async function LocaleLayout({children,params}) {
  const {locale}=await params;
  if(!['en','ar'].includes(locale))notFound();
  const ar=locale==='ar';
  const schema={
    '@context':'https://schema.org',
    '@type':'ProfessionalService',
    name:company.name,
    foundingDate:company.year,
    email:company.email,
    telephone:company.phone,
    url:`https://${company.website}`,
    address:{
      '@type':'PostalAddress',
      streetAddress:'ADCP Building No. P1239, Plot No. C125, Musaffah East 9, behind Safeer Mall, Mezzanine Floor, Office 3',
      postOfficeBoxNumber:'114789',
      addressLocality:'Abu Dhabi',
      addressCountry:'AE',
    },
  };
  return <div dir={ar?'rtl':'ltr'}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/>
    <a className="skip" href="#main">{ar?'انتقل إلى المحتوى':'Skip to content'}</a>
    <Header locale={locale}/><SiteMotion locale={locale}/><main id="main">{children}</main><Footer locale={locale}/><WhatsApp/>
  </div>;
}
