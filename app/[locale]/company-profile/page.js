import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  MapPin,
} from 'lucide-react';
import {
  company,
  mission,
  stats,
  strengths,
  vision,
  workLocations,
} from '@/data/company';
import {services, serviceGroups} from '@/data/services';
import {sectors} from '@/data/sectors';
import {featuredProjects, projectCategories} from '@/data/projects';
import {projectLifecycle} from '@/data/method';
import {
  generatedEditorialImages,
  sectorImages,
  serviceImages,
} from '@/data/image-manifest';
import CompanyProfileSubnav from '@/components/company-profile/CompanyProfileSubnav';
import CapabilitiesExplorer from '@/components/company-profile/CapabilitiesExplorer';
import CompanyProfileEnquiryCta from '@/components/company-profile/CompanyProfileEnquiryCta';

const PROFILE_HREF = '/downloads/asas-company-profile.pdf';
const PROFILE_SIZE = '7.7 MB';

function NextArrow({ar}) {
  return <ArrowRight size={15} className={ar ? 'cp-flip' : ''} />;
}

function projectImage(project) {
  return project?.visual?.src || project?.image || generatedEditorialImages.buildingsSector;
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  return {
    title: ar
      ? 'الملف التعريفي | أساس للاستشارات الهندسية وإدارة المشاريع'
      : 'ASAS Engineering & Project Management Consultancy | Company Profile',
    description: ar ? company.descriptionAr : company.description,
  };
}

export default async function CompanyProfile({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  const heroImage = generatedEditorialImages.homepageHero || generatedEditorialImages.buildingsSector;
  const overviewImage = generatedEditorialImages.corporateTeam || generatedEditorialImages.buildingsSector;
  const ctaImage = generatedEditorialImages.buildingsSector;

  const capabilityGroups = ['design', 'delivery', 'planning'].map((id) => ({
    id,
    label: serviceGroups[id].en,
    labelAr: serviceGroups[id].ar,
    services: services
      .filter((service) => service.group === id)
      .map((service) => ({
        ...service,
        image: serviceImages[service.slug] || generatedEditorialImages.technicalCoordination,
      })),
  }));

  const selectedProjects = featuredProjects.slice(0, 6);
  const featuredProject = selectedProjects[0];
  const otherProjects = selectedProjects.slice(1, 4);
  const approachSteps = projectLifecycle.slice(0, 6);

  return (
    <div className="cp">
      <section className="cp-hero" id="overview">
        <div className="cp-hero-media" aria-hidden="true">
          <Image src={heroImage} alt="" fill priority sizes="100vw" />
        </div>
        <div className="cp-hero-veil" aria-hidden="true" />
        <svg className="cp-hero-blueprint" viewBox="0 0 280 520" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M40 30 V480" />
            <path d="M80 70 V440" />
            <path d="M120 110 V400" />
            <path d="M160 150 V360" />
            <path d="M40 160 H210" />
            <path d="M40 250 H190" />
            <path d="M40 340 H170" />
            <circle cx="40" cy="160" r="3" fill="#e55021" stroke="none" />
          </g>
        </svg>
        <div className="cp-shell cp-hero-inner">
          <div className="cp-hero-copy">
            <p className="cp-kicker light">
              <i />
              {ar ? 'الملف التعريفي لأساس' : 'ASAS Company Profile'}
            </p>
            <h1>
              {ar ? (
                <>
                  <span>هندسة</span>
                  <span>لغدٍ</span>
                  <span>أفضل.</span>
                </>
              ) : (
                <>
                  <span>Engineering</span>
                  <span>a Better</span>
                  <span>Tomorrow.</span>
                </>
              )}
            </h1>
            <p className="cp-hero-lede">{ar ? company.shortDescriptionAr : company.shortDescription}</p>
            <div className="cp-hero-meta">
              <span>
                {ar ? company.cityAr : company.city}, {ar ? company.countryAr : company.country}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {ar ? 'تأسست' : 'Established'} {company.year}
              </span>
            </div>
            <div className="cp-hero-actions">
              <a className="cp-btn-primary" href="#story">
                {ar ? 'استكشف أساس' : 'Explore ASAS'}
                <ArrowDown size={15} />
              </a>
              <a className="cp-btn-ghost" href={PROFILE_HREF} download>
                {ar ? 'تحميل الملف التعريفي' : 'Download Company Profile'}
                <Download size={15} />
              </a>
            </div>
          </div>
          <ul className="cp-hero-words" aria-hidden="true">
            <li>{ar ? 'أشخاص' : 'People'}</li>
            <li>{ar ? 'أماكن' : 'Places'}</li>
            <li>{ar ? 'إمكانات' : 'Possibilities'}</li>
            <li>{ar ? 'غدٍ أفضل' : 'A Better Tomorrow'}</li>
          </ul>
        </div>
      </section>

      <CompanyProfileSubnav locale={locale} />

      <section className="cp-section cp-overview">
        <div className="cp-shell cp-overview-grid">
          <div className="cp-overview-copy">
            <p className="cp-kicker">
              <i />
              {ar ? 'نظرة عامة' : 'Overview'}
            </p>
            <h2>
              {ar ? (
                <>
                  خبرة هندسية
                  <br />
                  مبنية حول
                  <br />
                  مشاريع حقيقية.
                </>
              ) : (
                <>
                  Engineering expertise,
                  <br />
                  built around
                  <br />
                  real projects.
                </>
              )}
            </h2>
          </div>
          <div className="cp-overview-body">
            <p>{ar ? company.descriptionAr : company.description}</p>
            <p>{ar ? vision.ar : vision.en}</p>
            <p>{ar ? mission.ar : mission.en}</p>
          </div>
          <div className="cp-overview-media">
            <Image src={overviewImage} alt="" fill sizes="(max-width: 900px) 100vw, 32vw" />
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="cp-section cp-metrics">
          <div className="cp-shell">
            <dl className="cp-metrics-grid">
              {stats.map((item) => (
                <div key={item.label} className="cp-metric">
                  <dt>{item.value}</dt>
                  <dd>{ar ? item.labelAr : item.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      <section className="cp-section cp-story" id="story">
        <div className="cp-shell cp-story-grid">
          <div className="cp-story-copy">
            <p className="cp-kicker">
              <i />
              {ar ? 'قصتنا' : 'Our Story'}
            </p>
            <h2>
              {ar ? (
                <>
                  من أبوظبي،
                  <br />
                  منذ {company.year}.
                </>
              ) : (
                <>
                  From Abu Dhabi,
                  <br />
                  since {company.year}.
                </>
              )}
            </h2>
            <p>{ar ? company.descriptionAr : company.description}</p>
            <p className="cp-story-note">{ar ? company.parentGroupAr : company.parentGroup}</p>
          </div>
          <ol className="cp-timeline">
            <li>
              <span className="cp-timeline-year">{company.year}</span>
              <strong>{ar ? 'تأسيس الشركة في أبوظبي' : 'Company founded in Abu Dhabi'}</strong>
              <p>{ar ? company.shortDescriptionAr : company.shortDescription}</p>
            </li>
            <li>
              <span className="cp-timeline-year">{ar ? 'اليوم' : 'Today'}</span>
              <strong>{ar ? company.parentGroupAr : company.parentGroup}</strong>
              <p>{ar ? vision.ar : vision.en}</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="cp-section cp-capabilities" id="capabilities">
        <div className="cp-shell">
          <header className="cp-section-head">
            <p className="cp-kicker">
              <i />
              {ar ? 'ماذا نقدّم' : 'What We Do'}
            </p>
            <h2>
              {ar ? (
                <>
                  تخصصات متكاملة
                  <br />
                  من مكتب واحد.
                </>
              ) : (
                <>
                  Integrated disciplines
                  <br />
                  from one office.
                </>
              )}
            </h2>
          </header>
          <CapabilitiesExplorer locale={locale} groups={capabilityGroups} />
        </div>
      </section>

      <section className="cp-section cp-sectors" id="sectors">
        <div className="cp-shell">
          <header className="cp-section-head">
            <p className="cp-kicker">
              <i />
              {ar ? 'القطاعات' : 'Sectors We Serve'}
            </p>
            <h2>
              {ar ? (
                <>
                  مشاريع عبر
                  <br />
                  بيئات متعددة.
                </>
              ) : (
                <>
                  Projects across
                  <br />
                  multiple environments.
                </>
              )}
            </h2>
          </header>
          <div className="cp-sector-grid">
            {sectors.map((sector) => (
              <Link
                key={sector.slug}
                className="cp-sector-card"
                href={`/${locale}/sectors/${sector.slug}`}
              >
                <div className="cp-sector-media">
                  <Image
                    src={sectorImages[sector.slug] || generatedEditorialImages.buildingsSector}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 50vw, 22vw"
                  />
                </div>
                <div className="cp-sector-copy">
                  <strong>{ar ? sector.titleAr : sector.title}</strong>
                  <p>{ar ? sector.descriptionAr : sector.description}</p>
                  <span className="cp-text-cta">
                    {ar ? 'استكشف القطاع' : 'Explore sector'}
                    <NextArrow ar={ar} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cp-section cp-approach" id="approach">
        <div className="cp-shell">
          <header className="cp-section-head">
            <p className="cp-kicker">
              <i />
              {ar ? 'منهجيتنا' : 'Our Approach'}
            </p>
            <h2>
              {ar ? (
                <>
                  من الموجز إلى
                  <br />
                  التسليم.
                </>
              ) : (
                <>
                  From brief to
                  <br />
                  handover.
                </>
              )}
            </h2>
          </header>
          <ol className="cp-steps">
            {approachSteps.map((step) => (
              <li key={step.number}>
                <span className="cp-step-num">{step.number}</span>
                <strong>{ar ? step.titleAr : step.title}</strong>
                <p>{ar ? step.copyAr : step.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {selectedProjects.length > 0 && (
        <section className="cp-section cp-projects" id="projects">
          <div className="cp-shell">
            <div className="cp-projects-head">
              <div>
                <p className="cp-kicker">
                  <i />
                  {ar ? 'مشاريع مختارة' : 'Selected Projects'}
                </p>
                <h2>
                  {ar ? (
                    <>
                      أعمال من محفظة
                      <br />
                      أساس الرسمية.
                    </>
                  ) : (
                    <>
                      Work from the
                      <br />
                      official ASAS portfolio.
                    </>
                  )}
                </h2>
              </div>
              <Link className="cp-text-cta" href={`/${locale}/projects`}>
                {ar ? 'عرض كل المشاريع' : 'View all projects'}
                <NextArrow ar={ar} />
              </Link>
            </div>

            {featuredProject && (
              <Link
                className="cp-project-feature"
                href={`/${locale}/projects/${featuredProject.slug}`}
              >
                <div className="cp-project-feature-media">
                  <Image
                    src={projectImage(featuredProject)}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 100vw, 58vw"
                  />
                </div>
                <div className="cp-project-feature-copy">
                  {(() => {
                    const cat = projectCategories.find((item) => item.slug === featuredProject.category);
                    return cat ? (
                      <span className="cp-project-tag">{ar ? cat.titleAr : cat.title}</span>
                    ) : null;
                  })()}
                  <h3>{ar ? featuredProject.titleAr : featuredProject.title}</h3>
                  {(featuredProject.locationShort || featuredProject.location) && (
                    <p>
                      {ar
                        ? featuredProject.locationShortAr || featuredProject.locationAr
                        : featuredProject.locationShort || featuredProject.location}
                    </p>
                  )}
                  <span className="cp-text-cta">
                    {ar ? 'عرض المشروع' : 'View project'}
                    <NextArrow ar={ar} />
                  </span>
                </div>
              </Link>
            )}

            {otherProjects.length > 0 && (
              <div className="cp-project-grid">
                {otherProjects.map((project) => {
                  const cat = projectCategories.find((item) => item.slug === project.category);
                  return (
                    <Link
                      key={project.slug}
                      className="cp-project-card"
                      href={`/${locale}/projects/${project.slug}`}
                    >
                      <div className="cp-project-media">
                        <Image
                          src={projectImage(project)}
                          alt=""
                          fill
                          sizes="(max-width: 900px) 100vw, 30vw"
                        />
                      </div>
                      <div className="cp-project-copy">
                        {cat && (
                          <span className="cp-project-tag">{ar ? cat.titleAr : cat.title}</span>
                        )}
                        <h3>{ar ? project.titleAr : project.title}</h3>
                        {(project.locationShort || project.location) && (
                          <p>
                            {ar
                              ? project.locationShortAr || project.locationAr
                              : project.locationShort || project.location}
                          </p>
                        )}
                        <span className="cp-text-cta">
                          {ar ? 'عرض المشروع' : 'View project'}
                          <NextArrow ar={ar} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="cp-section cp-presence">
        <div className="cp-shell cp-presence-grid">
          <div className="cp-presence-copy">
            <p className="cp-kicker">
              <i />
              {ar ? 'التواجد' : 'Presence'}
            </p>
            <h2>
              {ar ? (
                <>
                  مكتب أبوظبي
                  <br />
                  ومشاريع عبر
                  <br />
                  الإمارات.
                </>
              ) : (
                <>
                  Abu Dhabi office,
                  <br />
                  work across
                  <br />
                  the Emirates.
                </>
              )}
            </h2>
            <div className="cp-office">
              <MapPin size={18} aria-hidden="true" />
              <div>
                <strong>{ar ? 'مكتب أبوظبي' : 'Abu Dhabi Office'}</strong>
                <p>{ar ? company.addressAr : company.address}</p>
                <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
              </div>
            </div>
          </div>
          {workLocations.length > 0 && (
            <ul className="cp-locations">
              {workLocations.map((place) => (
                <li key={place}>
                  <Building2 size={14} aria-hidden="true" />
                  <span>{place}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {strengths.length > 0 && (
        <section className="cp-section cp-why">
          <div className="cp-shell">
            <header className="cp-section-head">
              <p className="cp-kicker">
                <i />
                {ar ? 'لماذا أساس' : 'Why ASAS'}
              </p>
              <h2>
                {ar ? (
                  <>
                    قيمة مهنية
                    <br />
                    في كل مشروع.
                  </>
                ) : (
                  <>
                    Professional value
                    <br />
                    on every project.
                  </>
                )}
              </h2>
            </header>
            <div className="cp-why-grid">
              {strengths.map((item) => (
                <article key={item.title} className="cp-why-card">
                  <span className="cp-why-icon" aria-hidden="true">
                    <CheckCircle2 size={18} />
                  </span>
                  <h3>{ar ? item.titleAr : item.title}</h3>
                  <p>{ar ? item.copyAr : item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="cp-section cp-download">
        <div className="cp-shell cp-download-inner">
          <div className="cp-download-copy">
            <p className="cp-kicker">
              <i />
              {ar ? 'المستند الرسمي' : 'Official Document'}
            </p>
            <h2>{ar ? 'الملف التعريفي لشركة أساس' : 'ASAS Company Profile'}</h2>
            <p>
              {ar
                ? 'المستند المعتمد للتعريف بأساس — المصدر الرسمي للمعلومات عن الشركة والأعمال.'
                : 'The approved document for introducing ASAS — the official source for firm and portfolio information.'}
            </p>
            <ul className="cp-download-meta">
              <li>{ar ? 'صيغة' : 'Format'} · PDF</li>
              <li>{ar ? 'اللغة' : 'Language'} · {ar ? 'إنجليزي' : 'English'}</li>
              <li>{ar ? 'الحجم' : 'Size'} · {PROFILE_SIZE}</li>
            </ul>
            <div className="cp-download-actions">
              <a className="cp-btn-primary dark" href={PROFILE_HREF} download>
                <Download size={16} />
                {ar ? 'تحميل الملف' : 'Download Profile'}
              </a>
              <a
                className="cp-text-cta"
                href={PROFILE_HREF}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText size={15} />
                {ar ? 'فتح ملف PDF' : 'Open PDF'}
                <NextArrow ar={ar} />
              </a>
            </div>
          </div>
          <div className="cp-download-visual" aria-hidden="true">
            <Image src={generatedEditorialImages.homepageHero} alt="" fill sizes="40vw" />
            <span>
              <FileText size={22} />
              PDF
            </span>
          </div>
        </div>
      </section>

      <CompanyProfileEnquiryCta locale={locale} image={ctaImage} />
    </div>
  );
}
