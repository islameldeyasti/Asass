import Image from 'next/image';
import {notFound} from 'next/navigation';
import {services, serviceGroups} from '@/data/services';
import {designMethod, supervisionMethod, sustainabilityProcess} from '@/data/method';
import {serviceImages} from '@/data/image-manifest';
import {Container, SectionTitle, ArrowLink, CTA} from '@/components/UI';

export function generateStaticParams() {
  return services.flatMap((service) => ['en', 'ar'].map((locale) => ({locale, slug: service.slug})));
}

export async function generateMetadata({params}) {
  const {locale, slug} = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  return {
    title: `${locale === 'ar' ? service.titleAr : service.title} | ASAS`,
    description: locale === 'ar' ? service.descriptionAr : service.description,
  };
}

export default async function Service({params}) {
  const {locale, slug} = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  const ar = locale === 'ar';
  const group = serviceGroups[service.group];
  const methodology = slug === 'construction-supervision'
    ? supervisionMethod
    : slug === 'sustainability-green-building'
      ? sustainabilityProcess.map((item) => ({en: item.en, ar: item.ar}))
      : designMethod;

  return <>
    <section className="page-hero"><Container>
      <span className="breadcrumb">ASAS / {ar ? 'الخدمات' : 'Services'} / {ar ? service.titleAr : service.title}</span>
      <p className="eyebrow">{ar ? group.ar : group.en}</p>
      <h1>{ar ? service.titleAr : service.title}</h1>
      <p>{ar ? service.descriptionAr : service.description}</p>
    </Container></section>

    <section><Container className="intro-grid">
      <div>
        <SectionTitle eyebrow={ar ? 'النطاق' : 'SCOPE'} title={ar ? 'قدرات مرتبطة باحتياجات المشروع.' : 'Capabilities aligned with project requirements.'}/>
        <Image
          className="service-detail-image"
          src={serviceImages[slug]}
          alt=""
          width={['infrastructure-urban-planning', 'traffic-studies'].includes(slug) ? 800 : 1280}
          height={['infrastructure-urban-planning', 'traffic-studies'].includes(slug) ? 600 : 960}
        />
      </div>
      <div className="cap-list">
        {(ar ? service.capabilitiesAr : service.capabilities).map((capability) => <span key={capability}>{capability}</span>)}
      </div>
    </Container></section>

    <section className="services"><Container className="capabilities">
      <div><SectionTitle eyebrow={ar ? 'منهج العمل' : 'METHOD'} title={ar ? 'تنسيق ومراجعة عبر مراحل العمل.' : 'Coordination and review through the work.'}/></div>
      <div className="cap-list">{methodology.map((item) => <span key={item.en}>{ar ? item.ar : item.en}</span>)}</div>
    </Container></section>

    <section><Container>
      <SectionTitle title={ar ? 'خدمات مرتبطة' : 'Related services'}/>
      <div className="service-grid">
        {services.filter((item) => item.slug !== slug && item.group === service.group).slice(0, 3).map((item) => (
          <article className="service-card" key={item.slug}>
            <h3>{ar ? item.titleAr : item.title}</h3>
            <p>{ar ? item.descriptionAr : item.description}</p>
            <ArrowLink href={`/${locale}/services/${item.slug}`}>{ar ? 'عرض الخدمة' : 'View service'}</ArrowLink>
          </article>
        ))}
      </div>
    </Container></section>
    <CTA locale={locale}/>
  </>;
}
