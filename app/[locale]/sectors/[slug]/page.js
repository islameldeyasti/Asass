import Image from 'next/image';
import {notFound} from 'next/navigation';
import {sectors} from '@/data/sectors';
import {projects} from '@/data/projects';
import {services} from '@/data/services';
import {sectorImages} from '@/data/image-manifest';
import {Container, SectionTitle, ArrowLink, CTA} from '@/components/UI';

export function generateStaticParams() {
  return sectors.flatMap((sector) => ['en', 'ar'].map((locale) => ({locale, slug: sector.slug})));
}

export async function generateMetadata({params}) {
  const {locale, slug} = await params;
  const sector = sectors.find((item) => item.slug === slug);
  if (!sector) return {};
  return {
    title: `${locale === 'ar' ? sector.titleAr : sector.title} | ASAS`,
    description: locale === 'ar' ? sector.descriptionAr : sector.description,
  };
}

export default async function Sector({params}) {
  const {locale, slug} = await params;
  const sector = sectors.find((item) => item.slug === slug);
  if (!sector) notFound();
  const ar = locale === 'ar';
  const categories = sector.relatedCategories || [sector.projectCategory];
  const relatedProjects = projects.filter((project) => categories.includes(project.category)).slice(0, 6);
  const relatedServices = services.filter((service) => {
    if (slug.includes('interior')) return service.slug === 'interior-design';
    if (slug.includes('infrastructure')) return ['infrastructure-urban-planning', 'traffic-studies'].includes(service.slug);
    return ['architectural-design', 'civil-structural-engineering', 'mep-engineering-design', 'construction-supervision'].includes(service.slug);
  });

  return <>
    <section className="page-hero"><Container>
      <span className="breadcrumb">ASAS / {ar ? 'القطاعات' : 'Sectors'}</span>
      <h1>{ar ? sector.titleAr : sector.title}</h1>
      <p>{ar ? sector.descriptionAr : sector.description}</p>
    </Container></section>
    <section><Container>
      <SectionTitle title={ar ? 'الخبرات ذات الصلة' : 'Relevant capabilities'}/>
      {sectorImages[slug] && <Image
        className="sector-detail-image"
        src={sectorImages[slug]}
        alt=""
        width={slug === 'infrastructure-urban-planning' ? 936 : 1280}
        height={slug === 'infrastructure-urban-planning' ? 624 : 960}
      />}
      <div className="service-grid">{relatedServices.map((service) => (
        <article className="service-card" key={service.slug}>
          <h3>{ar ? service.titleAr : service.title}</h3>
          <p>{ar ? service.descriptionAr : service.description}</p>
          <ArrowLink href={`/${locale}/services/${service.slug}`}>{ar ? 'عرض الخدمة' : 'View service'}</ArrowLink>
        </article>
      ))}</div>
    </Container></section>
    {relatedProjects.length > 0 && <section className="services"><Container>
      <SectionTitle title={ar ? 'مشاريع مختارة' : 'Selected projects'}/>
      <div className="service-grid">{relatedProjects.map((project) => (
        <article className="service-card" key={project.slug}>
          <h3>{ar ? project.titleAr : project.title}</h3>
          {project.location && <p>{ar ? project.locationAr : project.location}</p>}
          <ArrowLink href={`/${locale}/projects/${project.slug}`}>{ar ? 'عرض المشروع' : 'View project'}</ArrowLink>
        </article>
      ))}</div>
    </Container></section>}
    <CTA locale={locale}/>
  </>;
}
