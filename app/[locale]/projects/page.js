import Image from 'next/image';
import {projectHeroVisuals} from '@/data/projects';
import ProjectsExplorer from '@/components/ProjectsExplorer';
import ProjectsEnquiryCta from '@/components/ProjectsEnquiryCta';

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
  const heroLeft = projectHeroVisuals[0];
  const heroRight = projectHeroVisuals[1] || projectHeroVisuals[0];

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
                <span>من محفظة أساس.</span>
              </>
            ) : (
              <>
                <span>Selected work</span>
                <span>from the ASAS</span>
                <span>portfolio.</span>
              </>
            )}
          </h1>
          <p className="pl-hero-lede">
            {ar
              ? 'أبراج ومبانٍ تجارية وسكنية ومنشآت صناعية وبنية تحتية ومدارس وفلل وتصميمات داخلية في أبوظبي والعين والشارقة ودبي.'
              : 'Towers, commercial and residential buildings, industrial facilities, infrastructure, schools, villas and interiors across Abu Dhabi, Al Ain, Sharjah and Dubai.'}
          </p>
          <p className="pl-hero-tag">
            {ar ? 'مشاريع حقيقية. مجتمعات أقوى.' : 'Real projects. Stronger communities.'}
          </p>
        </div>
      </section>

      <section className="pl-body">
        <div className="pl-shell">
          <ProjectsExplorer locale={locale} />
        </div>
      </section>

      <ProjectsEnquiryCta locale={locale} image={heroLeft} />
    </div>
  );
}
