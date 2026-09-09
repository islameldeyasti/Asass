import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CircuitBoard,
  ClipboardCheck,
  Compass,
  HardHat,
  Leaf,
  Ruler,
  Layers,
  Target,
  CheckCircle2,
} from 'lucide-react';
import {sectors} from '@/data/sectors';
import {projects, projectCategories} from '@/data/projects';
import {services} from '@/data/services';
import {company, strengths} from '@/data/company';
import {projectLifecycle} from '@/data/method';
import {getSectorImage, roleImages} from '@/data/image-manifest';
import SectorDetailSubnav from '@/components/sectors/SectorDetailSubnav';
import SectorDetailEnquiryCta from '@/components/sectors/SectorDetailEnquiryCta';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import ProjectVisualFallback from '@/components/ProjectVisualFallback';

const PROFILE_HREF = '/downloads/asas-company-profile.pdf';

const serviceIcons = {
  'architectural-design': Building2,
  'civil-structural-engineering': Ruler,
  'mep-engineering-design': CircuitBoard,
  'quantities-cost': ClipboardCheck,
  'interior-design': Layers,
  'landscape-design': Leaf,
  'project-management': ClipboardCheck,
  'construction-supervision': HardHat,
  'infrastructure-urban-planning': Compass,
  'traffic-studies': Target,
  'sustainability-green-building': Leaf,
  'studies-specifications': ClipboardCheck,
  'health-safety-fire-design': HardHat,
};

function splitTitle(title) {
  const words = title.trim().split(/\s+/);
  if (words.length <= 2) return words;
  if (title.includes('&')) {
    const [a, b] = title.split('&').map((part) => part.trim());
    return b ? [`${a} &`, b] : words;
  }
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

function relatedServicesForSector(slug) {
  return services.filter((service) => {
    if (slug.includes('interior')) return service.slug === 'interior-design';
    if (slug.includes('infrastructure')) {
      return ['infrastructure-urban-planning', 'traffic-studies'].includes(service.slug);
    }
    return [
      'architectural-design',
      'civil-structural-engineering',
      'mep-engineering-design',
      'construction-supervision',
    ].includes(service.slug);
  });
}

function projectImage(project) {
  return project?.visual?.src || project?.image || null;
}

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
  const title = ar ? sector.titleAr : sector.title;
  const description = ar ? sector.descriptionAr : sector.description;
  const titleLines = splitTitle(title);
  const categories = sector.relatedCategories || [sector.projectCategory];
  const categoryMeta = projectCategories.find((item) => item.slug === sector.projectCategory);
  const categoryLabel = categoryMeta
    ? ar
      ? categoryMeta.titleAr
      : categoryMeta.title
    : null;

  const relatedProjects = projects
    .filter((project) => categories.includes(project.category))
    .slice(0, 3);
  const relatedServices = relatedServicesForSector(slug);
  const relatedSectors = sectors.filter((item) => item.slug !== slug).slice(0, 4);
  const approachSteps = projectLifecycle.slice(0, 4);
  const heroFeatures = strengths.slice(0, 3);

  const {src: heroSrc, imagePosition: heroPosition} = getSectorImage(slug);
  const heroImage = heroSrc || roleImages.SECTOR_BUILDINGS;
  const overviewImage = getSectorImage(slug);
  const ctaImage = null;

  return (
    <div className="sc">
      <section className="sc-hero" id="overview">
        <div className="sc-hero-media" aria-hidden="true">
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{objectFit: 'cover', objectPosition: heroPosition}}
          />
        </div>
        <div className="sc-hero-veil" aria-hidden="true" />
        <svg className="sc-hero-blueprint" viewBox="0 0 260 460" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M36 24 V430" />
            <path d="M76 54 V400" />
            <path d="M116 84 V370" />
            <path d="M156 114 V340" />
            <path d="M36 130 H190" />
            <path d="M36 210 H170" />
            <path d="M36 290 H150" />
            <circle cx="36" cy="130" r="3" fill="#a02315" stroke="none" />
          </g>
        </svg>
        <div className="sc-shell sc-hero-inner">
          <div className="sc-hero-copy">
            <p className="sc-breadcrumb">{ar ? 'أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS'} / {ar ? 'القطاعات' : 'Sectors'}</p>
            {categoryLabel && (
              <p className="sc-kicker light">
                <i />
                {categoryLabel}
              </p>
            )}
            <h1>
              {titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className="sc-hero-lede">{description}</p>
            {heroFeatures.length > 0 && (
              <ul className="sc-hero-features">
                {heroFeatures.map((item) => (
                  <li key={item.title}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>{ar ? item.titleAr : item.title}</span>
                  </li>
                ))}
              </ul>
            )}
            <ActionGroup className="sc-hero-actions">
              <ActionButton variant="primary" href={`/${locale}/project-enquiry`}>
                {ar ? 'ابدأ مشروعاً' : 'Start a Project'}
              </ActionButton>
              <ActionButton
                variant="ghost"
                href={relatedProjects.length ? '#projects' : '#approach'}
              >
                {ar ? 'استكشف أعمالنا' : 'Explore our work'}
              </ActionButton>
            </ActionGroup>
          </div>
          <ul className="sc-hero-words" aria-hidden="true">
            <li>{ar ? 'أشخاص' : 'People'}</li>
            <li>{ar ? 'أماكن' : 'Places'}</li>
            <li>{ar ? 'إمكانات' : 'Possibilities'}</li>
            <li>{ar ? 'غدٍ' : 'A Better'}</li>
            <li>{ar ? 'أفضل' : 'Tomorrow'}</li>
          </ul>
        </div>
      </section>

      <SectorDetailSubnav
        locale={locale}
        showDownload
        downloadHref={PROFILE_HREF}
        downloadLabel={ar ? 'تحميل الملف التعريفي' : 'Download Company Profile'}
      />

      <section className="sc-section sc-overview">
        <div className="sc-shell sc-overview-grid">
          <div className="sc-overview-copy">
            <p className="sc-kicker">
              <i />
              {ar ? 'نظرة عامة' : 'Overview'}
            </p>
            <h2>
              {ar ? (
                <>
                  هندسة لغدٍ
                  <br />
                  أفضل.
                </>
              ) : (
                <>
                  Engineering a
                  <br />
                  better tomorrow.
                </>
              )}
            </h2>
            <p>{description}</p>
          </div>

          <div
            className={`sc-overview-media${overviewImage.src ? '' : ' sc-overview-media--panel'}`}
            aria-hidden="true"
          >
            {overviewImage.src ? (
              <Image
                src={overviewImage.src}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 40vw"
                style={{objectFit: 'cover', objectPosition: overviewImage.imagePosition}}
              />
            ) : (
              <div className="sc-overview-panel">
                <span>{ar ? 'قطاع' : 'Sector'}</span>
                <strong>{title}</strong>
              </div>
            )}
          </div>

          {relatedServices.length > 0 && (
            <ul className="sc-cap-list" id="capabilities">
              {relatedServices.map((service) => {
                const Icon = serviceIcons[service.slug] || Building2;
                const copy = ar ? service.descriptionAr : service.description;
                return (
                  <li key={service.slug}>
                    <span className="sc-cap-icon" aria-hidden="true">
                      <Icon size={16} />
                    </span>
                    <div>
                      <strong>{ar ? service.titleAr : service.title}</strong>
                      <p>{copy}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {relatedServices.length > 0 && (
        <section className="sc-section sc-expertise">
          <div className="sc-shell">
            <header className="sc-section-head">
              <p className="sc-kicker">
                <i />
                {ar ? 'الخبرات' : 'Capabilities'}
              </p>
              <h2>
                {ar ? (
                  <>
                    تخصصات داعمة
                    <br />
                    لهذا القطاع.
                  </>
                ) : (
                  <>
                    Supporting disciplines
                    <br />
                    for this sector.
                  </>
                )}
              </h2>
            </header>
            <div className="sc-expertise-grid">
              {relatedServices.map((service) => {
                const Icon = serviceIcons[service.slug] || Building2;
                return (
                  <Link
                    key={service.slug}
                    className="sc-expertise-item"
                    href={`/${locale}/services/${service.slug}`}
                  >
                    <span className="sc-cap-icon" aria-hidden="true">
                      <Icon size={16} />
                    </span>
                    <strong>{ar ? service.titleAr : service.title}</strong>
                    <span className="sc-text-cta">
                      {ar ? 'عرض الخدمة' : 'View service'}
                      <ArrowRight size={14} className={ar ? 'sc-flip' : ''} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {relatedProjects.length > 0 && (
        <section className="sc-section sc-projects" id="projects">
          <div className="sc-shell">
            <div className="sc-projects-head">
              <div>
                <p className="sc-kicker">
                  <i />
                  {ar ? 'مشاريع مميزة' : 'Featured Projects'}
                </p>
                <h2>
                  {ar ? (
                    <>
                      خبرتنا في هذا
                      <br />
                      القطاع عملياً.
                    </>
                  ) : (
                    <>
                      Our sector
                      <br />
                      expertise in action.
                    </>
                  )}
                </h2>
              </div>
              <Link className="sc-text-cta" href={`/${locale}/projects`}>
                {ar ? 'عرض كل المشاريع' : 'View all projects'}
                <ArrowRight size={15} className={ar ? 'sc-flip' : ''} />
              </Link>
            </div>

            <div className="sc-project-grid">
              {relatedProjects.map((project) => {
                const cat = projectCategories.find((item) => item.slug === project.category);
                return (
                  <Link
                    key={project.slug}
                    className="sc-project-card"
                    href={`/${locale}/projects/${project.slug}`}
                  >
                    <div className="sc-project-media">
                      {projectImage(project) ? (
                        <Image
                          src={projectImage(project)}
                          alt=""
                          fill
                          sizes="(max-width: 900px) 100vw, 30vw"
                        />
                      ) : (
                        <ProjectVisualFallback project={project} locale={locale} />
                      )}
                    </div>
                    <div className="sc-project-copy">
                      {cat && (
                        <span className="sc-project-tag">{ar ? cat.titleAr : cat.title}</span>
                      )}
                      <h3>{ar ? project.titleAr : project.title}</h3>
                      {(project.locationShort || project.location) && (
                        <p>{ar ? project.locationShortAr || project.locationAr : project.locationShort || project.location}</p>
                      )}
                      <span className="sc-card-link">
                        {ar ? 'عرض المشروع' : 'View project'}
                        <ArrowRight size={14} className={ar ? 'sc-flip' : ''} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="sc-section sc-approach" id="approach">
        <div className="sc-shell sc-approach-grid">
          <div className="sc-approach-copy">
            <p className="sc-kicker">
              <i />
              {ar ? 'منهجيتنا' : 'Our Approach'}
            </p>
            <h2>
              {ar ? (
                <>
                  من الفكرة إلى
                  <br />
                  التسليم.
                </>
              ) : (
                <>
                  From concept to
                  <br />
                  delivery.
                </>
              )}
            </h2>
            <p>{ar ? company.shortDescriptionAr : company.shortDescription}</p>
          </div>
          <ol className="sc-steps">
            {approachSteps.map((step, index) => (
              <li key={step.number}>
                <span className="sc-step-num">{step.number}</span>
                <div>
                  <strong>{ar ? step.titleAr : step.title}</strong>
                  <p>{ar ? step.copyAr : step.copy}</p>
                </div>
                {index < approachSteps.length - 1 && <i className="sc-step-line" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {relatedSectors.length > 0 && (
        <section className="sc-section sc-related" id="related-sectors">
          <div className="sc-shell">
            <header className="sc-section-head">
              <p className="sc-kicker">
                <i />
                {ar ? 'قطاعات مرتبطة' : 'Related Sectors'}
              </p>
              <h2>
                {ar ? (
                  <>
                    استكشف بيئات
                    <br />
                    مشاريع متصلة.
                  </>
                ) : (
                  <>
                    Explore connected
                    <br />
                    project environments.
                  </>
                )}
              </h2>
            </header>
            <div className="sc-related-grid">
              {relatedSectors.map((item) => {
                const relatedImage = getSectorImage(item.slug);
                return (
                  <Link
                    key={item.slug}
                    className="sc-related-card"
                    href={`/${locale}/sectors/${item.slug}`}
                  >
                    <div
                      className={`sc-related-media${relatedImage.src ? '' : ' sc-related-media--tone'}`}
                      aria-hidden="true"
                    >
                      {relatedImage.src ? (
                        <Image
                          src={relatedImage.src}
                          alt=""
                          fill
                          sizes="(max-width: 700px) 50vw, 25vw"
                          style={{objectFit: 'cover', objectPosition: relatedImage.imagePosition}}
                        />
                      ) : null}
                    </div>
                    <div className="sc-related-copy">
                      <strong>{ar ? item.titleAr : item.title}</strong>
                      <ArrowUpRight size={16} className={ar ? 'sc-flip' : ''} aria-hidden="true" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <SectorDetailEnquiryCta
        locale={locale}
        image={ctaImage}
        title={ar ? 'هل تخطط لمشروع جديد؟' : 'Planning a New Project?'}
      />
    </div>
  );
}
