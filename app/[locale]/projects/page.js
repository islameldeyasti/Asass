import Image from 'next/image';
import {projectHeroVisuals} from '@/data/projects';
import ProjectsExplorer from '@/components/ProjectsExplorer';
import ProjectsEnquiryCta from '@/components/ProjectsEnquiryCta';
import {ctaBandImages} from '@/data/image-manifest';
import {getPublicProjects} from '@/lib/cms/public-data';
import {staticPageMetadata} from '@/lib/cms/seo/page-meta';

export const dynamic = 'force-dynamic';

export const generateMetadata = staticPageMetadata({
  path: 'projects',
  titleEn: 'Selected Projects',
  titleAr: 'مشاريع أساس للاستشارات الهندسية وإدارة المشاريع المختارة',
  descriptionEn:
    'Selected ASAS projects across towers, buildings, industry, infrastructure, schools, villas and interior design.',
  descriptionAr:
    'مشاريع أساس للاستشارات الهندسية وإدارة المشاريع المختارة في الأبراج والمباني والصناعة والبنية التحتية والمدارس والفلل والتصميم الداخلي.',
});


export default async function Projects({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  const projects = await getPublicProjects();
  const heroLeft = projectHeroVisuals[0];
  const heroRight = projectHeroVisuals[1] || projectHeroVisuals[0];
  const ctaImage = {src: ctaBandImages.projects, crop: '50% 40%'};

  return (
    <div className="pl">
      <section className="pl-hero">
        <div className="pl-hero-media" aria-hidden="true">
          <div className="pl-hero-photo">
            <Image src={heroLeft.src} alt="" fill priority sizes="65vw" style={{objectPosition: heroLeft.crop}} />
          </div>
          <div className="pl-hero-plan">
            <Image src={heroRight.src} alt="" fill sizes="40vw" style={{objectPosition: heroRight.crop}} />
            <div className="pl-hero-plan-copy">
              <span>{ar ? 'تخطيط' : 'Planning'}</span>
              <span>{ar ? 'ناس' : 'People'}</span>
              <span>{ar ? 'تقدم' : 'Progress'}</span>
            </div>
            <p>{ar ? 'من الرؤية إلى بنية تحتية دائمة.' : 'From vision to lasting infrastructure.'}</p>
          </div>
          <div className="pl-hero-veil" />
        </div>

        <div className="pl-hero-copy">
          <p className="pl-kicker light">
            <i />
            {ar ? 'مشاريعنا' : 'Our Projects'}
          </p>
          <h1>
            {ar ? (
              <>
                <span>أعمال مختارة</span>
                <span>من محفظة أساس للاستشارات الهندسية وإدارة المشاريع</span>
              </>
            ) : (
              <>
                <span>Selected work</span>
                <span>from the ASAS</span>
                <span>portfolio</span>
              </>
            )}
          </h1>
          <p className="pl-hero-lede">
            {ar
              ? 'أبراج ومبانٍ تجارية وسكنية ومنشآت صناعية وبنية تحتية ومدارس وفلل وتصميمات داخلية في أبوظبي والعين والشارقة ودبي.'
              : 'Towers, commercial and residential buildings, industrial facilities, infrastructure, schools, villas and interiors across Abu Dhabi, Al Ain, Sharjah and Dubai.'}
          </p>
          <p className="pl-hero-tag">
            {ar ? 'مشاريع حقيقية، مجتمعات أقوى' : 'Real projects, stronger communities'}
          </p>
        </div>
      </section>

      <section className="pl-body">
        <div className="pl-shell">
          <ProjectsExplorer locale={locale} items={projects} />
        </div>
      </section>

      <ProjectsEnquiryCta locale={locale} image={ctaImage} />
    </div>
  );
}
