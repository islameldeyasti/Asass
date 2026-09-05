import Image from 'next/image';
import {projectHeroVisuals} from '@/data/projects';
import {company} from '@/data/company';
import {Container, CTA} from '@/components/UI';
import ProjectsExplorer from '@/components/ProjectsExplorer';

export async function generateMetadata({params}) {
  const {locale} = await params;
  return {
    title: locale === 'ar' ? 'مشاريع أساس المختارة' : 'Selected Projects | ASAS',
    description: locale === 'ar'
      ? 'مشاريع أساس المختارة في الأبراج والمباني والصناعة والبنية التحتية والمدارس والفلل والتصميم الداخلي.'
      : 'Selected ASAS projects across towers, buildings, industry, infrastructure, schools, villas and interior design.',
  };
}

export default async function Projects({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';

  return (
    <div className="projects-index">
      <section className="projects-hero">
        <div className="projects-hero-collage" aria-hidden="true">
          {projectHeroVisuals.map((visual) => (
            <div className="projects-hero-tile" key={visual.src}>
              <Image src={visual.src} alt="" fill sizes="40vw" style={{objectPosition: visual.crop}} />
            </div>
          ))}
        </div>
        <Container>
          <span className="breadcrumb">ASAS / {ar ? 'المشاريع' : 'Projects'}</span>
          <h1>{ar ? 'مشاريع مختارة من أعمال أساس.' : 'Selected work from the ASAS portfolio.'}</h1>
          <p>{ar
            ? 'أبراج ومبانٍ تجارية وسكنية ومنشآت صناعية وبنية تحتية ومدارس وفلل وتصميمات داخلية في أبوظبي والعين والشارقة ودبي.'
            : 'Towers, commercial and residential buildings, industrial facilities, infrastructure, schools, villas and interiors across Abu Dhabi, Al Ain, Sharjah and Dubai.'}</p>
          <div className="projects-hero-meta">
            <span>{ar ? company.cityAr : company.city} · {company.year}</span>
          </div>
        </Container>
      </section>

      <section className="projects-body">
        <Container>
          <ProjectsExplorer locale={locale} />
        </Container>
      </section>

      <CTA locale={locale} />
    </div>
  );
}
