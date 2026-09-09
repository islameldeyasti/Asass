import Link from 'next/link';
import Image from 'next/image';
import {ArrowRight, Building2, Factory, GraduationCap, Hotel, Landmark, Route, Trees} from 'lucide-react';
import {Container} from '@/components/UI';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import {sectors} from '@/data/sectors';
import {projects} from '@/data/projects';
import {company} from '@/data/company';
import {getSectorImage, roleImages} from '@/data/image-manifest';

const sectorIcons = {
  'towers-high-rise': Landmark,
  'commercial-residential-buildings': Building2,
  'industrial-showrooms': Factory,
  'infrastructure-urban-planning': Route,
  education: GraduationCap,
  'villas-compounds-palaces': Trees,
  'interior-hospitality-retail': Hotel,
};

function NextArrow({ar}) {
  return <ArrowRight size={16} className={ar ? 'reverse-arrow' : ''} />;
}

function projectCountFor(sector) {
  const categories = sector.relatedCategories || [sector.projectCategory];
  return projects.filter((project) => categories.includes(project.category)).length;
}

function SectorMedia({slug, className, indexLabel, sizes}) {
  const {src, imagePosition} = getSectorImage(slug);
  return (
    <div className={`${className}${src ? '' : ` ${className}--tone`}`} aria-hidden="true">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          style={{objectFit: 'cover', objectPosition: imagePosition}}
        />
      ) : null}
      {indexLabel ? <span className={className.includes('featured') ? 'sectors-featured-index' : 'sectors-card-index'}>{indexLabel}</span> : null}
    </div>
  );
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  return {
    title: locale === 'ar' ? 'قطاعات أساس للاستشارات الهندسية وإدارة المشاريع' : 'Project Sectors | ASAS',
    description: locale === 'ar'
      ? 'قطاعات مدعومة بخدمات أساس للاستشارات الهندسية وإدارة المشاريع وخبرتها الواردة في الملف التعريفي.'
      : 'Project sectors supported by ASAS capabilities and portfolio experience.',
  };
}

export default async function Sectors({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  const featured = sectors[0];
  const rest = sectors.slice(1);
  const featuredCount = projectCountFor(featured);

  return (
    <div className="sectors-index">
      <section className="sectors-hero">
        <div className="sectors-hero-photo" aria-hidden="true">
          <Image
            src={roleImages.SECTORS_HERO}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <Container>
          <span className="breadcrumb">{ar ? 'أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS'} / {ar ? 'القطاعات' : 'Sectors'}</span>
          <h1>
            {ar
              ? 'قطاعات مدعومة بخبرة هندسية ومشاريع فعلية.'
              : 'Sectors supported by engineering capability and project experience.'}
          </h1>
          <p>
            {ar
              ? 'تغطي أعمال أساس للاستشارات الهندسية وإدارة المشاريع الأبراج والمباني والمنشآت الصناعية والبنية التحتية والمدارس والفلل والتصميم الداخلي.'
              : 'ASAS work covers towers, buildings, industrial facilities, infrastructure, schools, villas and interior design.'}
          </p>
          <div className="sectors-hero-meta">
            <span>{sectors.length} {ar ? 'قطاعات' : 'sectors'}</span>
            <span>{ar ? company.cityAr : company.city} · {company.year}</span>
            <Link href={`/${locale}/projects`}>{ar ? 'عرض المشاريع' : 'View projects'}</Link>
          </div>
        </Container>
      </section>

      <section className="sectors-body">
        <Container>
          <header className="sectors-body-head">
            <p className="atlas-kicker">{ar ? 'خبرة القطاعات' : 'Sector experience'}</p>
            <h2>{ar ? 'خبرة القطاعات، مترابطة.' : 'Sector experience, connected.'}</h2>
            <p>
              {ar
                ? 'كل قطاع يرتبط بتخصصات التصميم والتنفيذ داخل المكتب — من العمارة والإنشاءات إلى الكهروميكانيكية والإشراف.'
                : 'Each sector connects to in-house design and delivery disciplines — from architecture and structure to MEP and supervision.'}
            </p>
          </header>

          <Link className="sectors-featured hp-card" href={`/${locale}/sectors/${featured.slug}`}>
            <SectorMedia
              slug={featured.slug}
              className="sectors-featured-media"
              indexLabel="01"
              sizes="(max-width: 900px) 100vw, 55vw"
            />
            <div className="sectors-featured-copy">
              <span className="sectors-featured-label">
                {ar ? 'قطاع مميز' : 'Featured sector'}
                {featuredCount > 0 ? ` · ${featuredCount} ${ar ? 'مشاريع' : 'projects'}` : ''}
              </span>
              <h3>{ar ? featured.titleAr : featured.title}</h3>
              <p>{ar ? featured.descriptionAr : featured.description}</p>
              <span className="atlas-link">
                {ar ? 'استكشف القطاع' : 'Explore sector'}
                <NextArrow ar={ar} />
              </span>
            </div>
          </Link>

          <div className="sectors-card-grid">
            {rest.map((sector, index) => {
              const Icon = sectorIcons[sector.slug] || Building2;
              const count = projectCountFor(sector);
              return (
                <Link
                  className="sectors-card hp-card"
                  href={`/${locale}/sectors/${sector.slug}`}
                  key={sector.slug}
                >
                  <SectorMedia
                    slug={sector.slug}
                    className="sectors-card-media"
                    indexLabel={String(index + 2).padStart(2, '0')}
                    sizes="(max-width: 700px) 100vw, 33vw"
                  />
                  <div className="sectors-card-copy">
                    <span className="sectors-card-icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <h3>{ar ? sector.titleAr : sector.title}</h3>
                    <p>{ar ? sector.descriptionAr : sector.description}</p>
                    <div className="sectors-card-foot">
                      <span>
                        {count > 0
                          ? `${count} ${ar ? 'مشاريع مرتبطة' : 'related projects'}`
                          : ar
                            ? 'خبرة قطاعية'
                            : 'Sector capability'}
                      </span>
                      <span className="atlas-link">
                        {ar ? 'عرض' : 'View'}
                        <NextArrow ar={ar} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="sectors-cta asas-cta-band">
        <div className="sectors-cta-veil" aria-hidden="true" />
        <Container className="sectors-cta-inner">
          <div className="sectors-cta-copy">
            <p className="sectors-cta-kicker">
              <i />
              {ar ? 'الخطوة التالية' : 'Next Step'}
            </p>
            <h2>
              {ar ? 'هل تخطط لمشروع في أحد هذه القطاعات؟' : 'Planning a project in one of these sectors?'}
            </h2>
            <p>
              {ar
                ? 'راجع المشاريع المختارة أو تواصل مع المكتب لبدء استفسار مشروع.'
                : 'Review selected work from the portfolio, or contact the office to start a project enquiry.'}
            </p>
            <ActionGroup className="sectors-cta-actions">
              <ActionButton variant="primary" href={`/${locale}/project-enquiry`}>
                {ar ? 'أرسل استفسار مشروع' : 'Submit a Project Enquiry'}
              </ActionButton>
              <ActionButton variant="ghost" href={`/${locale}/projects`}>
                {ar ? 'عرض المشاريع' : 'View projects'}
              </ActionButton>
            </ActionGroup>
          </div>
          <ul className="sectors-cta-words" aria-hidden="true">
            <li>{ar ? 'أشخاص' : 'People'}</li>
            <li>{ar ? 'أماكن' : 'Places'}</li>
            <li>{ar ? 'إمكانات' : 'Possibilities'}</li>
            <li>{ar ? 'غدٍ أفضل' : 'A Better Tomorrow'}</li>
          </ul>
        </Container>
      </section>
    </div>
  );
}
