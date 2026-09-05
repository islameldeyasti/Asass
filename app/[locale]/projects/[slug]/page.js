import Image from 'next/image';
import {notFound} from 'next/navigation';
import {projects, projectCategories} from '@/data/projects';
import {Container, SectionTitle, ArrowLink, CTA} from '@/components/UI';

const scopeAr = {
  'Architectural design': 'التصميم المعماري',
  'Structural engineering': 'الهندسة الإنشائية',
  'Electromechanical design': 'التصميم الكهروميكانيكي',
  'Traffic studies and analysis': 'دراسات وتحليل المرور',
  Infrastructure: 'البنية التحتية',
  'Urban planning': 'التخطيط الحضري',
  'Interior design': 'التصميم الداخلي',
};

export function generateStaticParams() {
  return projects.flatMap((project) => ['en', 'ar'].map((locale) => ({locale, slug: project.slug})));
}

export async function generateMetadata({params}) {
  const {locale, slug} = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: `${locale === 'ar' ? project.titleAr : project.title} | ASAS`,
    description: locale === 'ar' ? project.descriptionAr : project.description,
  };
}

export default async function Project({params}) {
  const {locale, slug} = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const ar = locale === 'ar';
  const category = projectCategories.find((item) => item.slug === project.category);
  const related = projects.filter((item) => item.category === project.category && item.slug !== project.slug).slice(0, 3);

  return <>
    <section className="page-hero"><Container>
      <span className="breadcrumb">ASAS / {ar ? 'المشاريع' : 'Projects'} / {ar ? project.titleAr : project.title}</span>
      <p className="eyebrow">{ar ? category?.titleAr : category?.title}</p>
      <h1>{ar ? project.titleAr : project.title}</h1>
      {project.location && <p>{ar ? project.locationAr : project.location}</p>}
    </Container></section>

    <section><Container className="intro-grid">
      <div>
        <Image
          className="project-detail-image"
          src={project.imageAsset?.portfolio || project.visual.src}
          alt={project.visual.classification === 'PROJECT_PHOTO' ? (ar ? project.titleAr : project.title) : ''}
          width={936}
          height={624}
          style={{objectPosition: project.visual.crop}}
        />
      </div>
      <div className="intro-copy">
        <SectionTitle eyebrow={ar ? 'ملخص المشروع' : 'PROJECT SUMMARY'} title={ar ? project.titleAr : project.title}/>
        <p>{ar ? project.descriptionAr : project.description}</p>
        <dl className="project-facts">
          <div><dt>{ar ? 'الفئة' : 'Category'}</dt><dd>{ar ? category?.titleAr : category?.title}</dd></div>
          {project.location && <div><dt>{ar ? 'الموقع' : 'Location'}</dt><dd>{ar ? project.locationAr : project.location}</dd></div>}
          {project.services.length > 0 && <div><dt>{ar ? 'النطاق' : 'Scope'}</dt><dd>{(ar ? project.services.map((item) => scopeAr[item] || item) : project.services).join(' · ')}</dd></div>}
        </dl>
      </div>
    </Container></section>

    {related.length > 0 && <section className="services"><Container>
      <SectionTitle title={ar ? 'مشاريع مرتبطة' : 'Related projects'}/>
      <div className="service-grid">{related.map((item) => <article className="service-card" key={item.slug}><h3>{ar ? item.titleAr : item.title}</h3>{item.location && <p>{ar ? item.locationAr : item.location}</p>}<ArrowLink href={`/${locale}/projects/${item.slug}`}>{ar ? 'عرض المشروع' : 'View project'}</ArrowLink></article>)}</div>
    </Container></section>}
    <CTA locale={locale}/>
  </>;
}
