import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CircuitBoard,
  ClipboardCheck,
  Compass,
  FileText,
  Flame,
  HardHat,
  Leaf,
  Ruler,
  Layers,
  PenTool,
  ShieldCheck,
  Target,
} from 'lucide-react';
import {services, serviceGroups} from '@/data/services';
import {sectors} from '@/data/sectors';
import {company} from '@/data/company';
import {designMethod, supervisionMethod, sustainabilityProcess} from '@/data/method';
import {generatedEditorialImages, sectorImages, serviceImages} from '@/data/image-manifest';
import ServiceDetailSubnav from '@/components/services/ServiceDetailSubnav';
import ServiceDetailEnquiryCta from '@/components/services/ServiceDetailEnquiryCta';

const serviceIcons = {
  'architectural-design': Building2,
  'civil-structural-engineering': Ruler,
  'mep-engineering-design': CircuitBoard,
  'quantities-cost': FileText,
  'interior-design': Layers,
  'landscape-design': Leaf,
  'project-management': ClipboardCheck,
  'construction-supervision': HardHat,
  'infrastructure-urban-planning': Compass,
  'traffic-studies': Target,
  'sustainability-green-building': Leaf,
  'studies-specifications': FileText,
  'health-safety-fire-design': Flame,
};

const capabilityIcons = [PenTool, Layers, FileText, ShieldCheck, Leaf, HardHat, Ruler, CircuitBoard];

function splitTitle(title) {
  const words = title.trim().split(/\s+/);
  if (words.length <= 2) return words;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

function methodSteps(slug) {
  if (slug === 'construction-supervision') {
    return supervisionMethod.map((item, index) => ({
      number: String(index + 1).padStart(2, '0'),
      en: item.en,
      ar: item.ar,
    }));
  }
  if (slug === 'sustainability-green-building') {
    return sustainabilityProcess.map((item) => ({
      number: item.number,
      en: item.en,
      ar: item.ar,
    }));
  }
  return designMethod.map((item, index) => ({
    number: String(index + 1).padStart(2, '0'),
    en: item.en,
    ar: item.ar,
  }));
}

function methodHeadline(text) {
  const first = text.split(/[,.]/)[0].trim();
  const words = first.split(/\s+/);
  if (words.length > 5) return words.slice(0, 4).join(' ');
  return first;
}

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
  const title = ar ? service.titleAr : service.title;
  const description = ar ? service.descriptionAr : service.description;
  const titleLines = splitTitle(title);
  const capabilities = ar ? service.capabilitiesAr : service.capabilities;
  const related = services.filter((item) => item.slug !== slug && item.group === service.group).slice(0, 3);
  const steps = methodSteps(slug);
  const heroImage = serviceImages[slug] || generatedEditorialImages.buildingsSector;
  const scopeImage = serviceImages[slug] || generatedEditorialImages.buildingsSector;
  const ctaImage = generatedEditorialImages.buildingsSector || heroImage;
  const sectorTiles = sectors.slice(0, 6);
  const ServiceIcon = serviceIcons[slug] || Building2;

  return (
    <div className="sd">
      <section className="sd-hero" id="overview">
        <div className="sd-hero-media" aria-hidden="true">
          <Image src={heroImage} alt="" fill priority sizes="100vw" />
        </div>
        <div className="sd-hero-veil" aria-hidden="true" />
        <svg className="sd-hero-blueprint" viewBox="0 0 280 480" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M40 30 V450" />
            <path d="M80 60 V420" />
            <path d="M120 90 V390" />
            <path d="M160 120 V360" />
            <path d="M40 140 H200" />
            <path d="M40 220 H180" />
            <path d="M40 300 H160" />
            <circle cx="40" cy="140" r="3" fill="#e55021" stroke="none" />
          </g>
        </svg>
        <div className="sd-shell sd-hero-inner">
          <div className="sd-hero-copy">
            <p className="sd-breadcrumb">
              ASAS / {ar ? 'الخدمات' : 'Services'} / {title}
            </p>
            <p className="sd-kicker light">
              <i />
              {ar ? group.ar : group.en}
            </p>
            <h1>
              {titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p className="sd-hero-lede">{description}</p>
            <a className="sd-hero-cta" href="#method">
              <span className="sd-hero-cta-icon" aria-hidden="true">
                <ArrowRight size={16} className={ar ? 'sd-flip' : ''} />
              </span>
              {ar ? 'استكشف منهجيتنا' : 'Explore our approach'}
            </a>
          </div>
          <ul className="sd-hero-words" aria-hidden="true">
            <li>{ar ? 'أشخاص' : 'People'}</li>
            <li>{ar ? 'أماكن' : 'Places'}</li>
            <li>{ar ? 'إمكانات' : 'Possibilities'}</li>
          </ul>
        </div>
      </section>

      <ServiceDetailSubnav locale={locale} />

      {capabilities?.length > 0 && (
        <section className="sd-section sd-scope" id="scope">
          <div className="sd-shell sd-scope-grid">
            <div className="sd-scope-copy">
              <p className="sd-kicker">
                <i />
                {ar ? 'النطاق' : 'Scope'}
              </p>
              <h2>
                {ar ? (
                  <>
                    قدرات منسجمة
                    <br />
                    مع متطلبات
                    <br />
                    المشروع.
                  </>
                ) : (
                  <>
                    Capabilities aligned
                    <br />
                    with project
                    <br />
                    requirements.
                  </>
                )}
              </h2>
              <p>{ar ? company.shortDescriptionAr : company.shortDescription}</p>
              <a className="sd-text-cta" href="#method">
                {ar ? 'منهجيتنا' : 'Our Approach'}
                <ArrowRight size={15} className={ar ? 'sd-flip' : ''} />
              </a>
            </div>

            <div className="sd-scope-media">
              <Image src={scopeImage} alt="" fill sizes="(max-width: 900px) 100vw, 28vw" />
            </div>

            <ul className="sd-cap-list">
              {capabilities.map((capability, index) => {
                const Icon = capabilityIcons[index % capabilityIcons.length];
                return (
                  <li key={capability}>
                    <span className="sd-cap-icon" aria-hidden="true">
                      <Icon size={16} />
                    </span>
                    <div>
                      <strong>{capability}</strong>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {sectorTiles.length > 0 && (
        <section className="sd-section sd-sectors" id="sectors">
          <div className="sd-shell sd-sectors-grid">
            <div className="sd-sectors-copy">
              <p className="sd-kicker">
                <i />
                {ar ? 'القطاعات' : 'Sectors Served'}
              </p>
              <h2>
                {ar ? (
                  <>
                    مشاريع متنوعة.
                    <br />
                    أثر دائم.
                  </>
                ) : (
                  <>
                    Diverse projects.
                    <br />
                    Lasting impact.
                  </>
                )}
              </h2>
              <p>{ar ? company.descriptionAr : company.description}</p>
              <Link className="sd-text-cta" href={`/${locale}/sectors`}>
                {ar ? 'استكشف كل القطاعات' : 'Explore all sectors'}
                <ArrowRight size={15} className={ar ? 'sd-flip' : ''} />
              </Link>
            </div>

            <div className="sd-sector-tiles">
              {sectorTiles.map((sector) => (
                <Link
                  key={sector.slug}
                  className="sd-sector-tile"
                  href={`/${locale}/sectors/${sector.slug}`}
                >
                  <div className="sd-sector-media">
                    <Image
                      src={sectorImages[sector.slug] || generatedEditorialImages.buildingsSector}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 50vw, 18vw"
                    />
                  </div>
                  <span className="sd-sector-icon" aria-hidden="true">
                    <Building2 size={14} />
                  </span>
                  <strong>{ar ? sector.titleAr : sector.title}</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="sd-section sd-method" id="method">
          <div className="sd-shell sd-method-grid">
            <div className="sd-method-copy">
              <p className="sd-kicker">
                <i />
                {ar ? 'منهج العمل' : 'Method'}
              </p>
              <h2>
                {ar ? (
                  <>
                    تنسيق ومراجعة
                    <br />
                    عبر مراحل
                    <br />
                    العمل.
                  </>
                ) : (
                  <>
                    Coordination and
                    <br />
                    review through
                    <br />
                    the work.
                  </>
                )}
              </h2>
              <p>{description}</p>
            </div>

            <ol className="sd-steps">
              {steps.map((step) => {
                const text = ar ? step.ar : step.en;
                const headline = methodHeadline(text);
                const showBody = headline !== text && text.length > headline.length + 8;
                return (
                  <li key={`${step.number}-${step.en}`}>
                    <span className="sd-step-num">{step.number}</span>
                    <div>
                      <strong>{headline}</strong>
                      {showBody && <p>{text}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="sd-section sd-related" id="related">
          <div className="sd-shell">
            <div className="sd-related-head">
              <div>
                <p className="sd-kicker">
                  <i />
                  {ar ? 'خدمات مرتبطة' : 'Related Services'}
                </p>
                <h2>
                  {ar ? (
                    <>
                      خبرات مكملة
                      <br />
                      لحلول متكاملة.
                    </>
                  ) : (
                    <>
                      Complementary
                      <br />
                      expertise for
                      <br />
                      complete solutions.
                    </>
                  )}
                </h2>
              </div>
            </div>

            <div className="sd-related-grid">
              {related.map((item) => {
                const Icon = serviceIcons[item.slug] || ServiceIcon;
                return (
                  <Link
                    key={item.slug}
                    className="sd-related-card"
                    href={`/${locale}/services/${item.slug}`}
                  >
                    <div className="sd-related-media">
                      <Image
                        src={serviceImages[item.slug] || generatedEditorialImages.technicalCoordination}
                        alt=""
                        fill
                        sizes="(max-width: 900px) 100vw, 30vw"
                      />
                      <span className="sd-related-arrow" aria-hidden="true">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                    <div className="sd-related-copy">
                      <span className="sd-related-icon" aria-hidden="true">
                        <Icon size={16} />
                      </span>
                      <h3>{ar ? item.titleAr : item.title}</h3>
                      <p>{ar ? item.descriptionAr : item.description}</p>
                      <span className="sd-card-link">
                        {ar ? 'عرض الخدمة' : 'View service'}
                        <ArrowRight size={14} className={ar ? 'sd-flip' : ''} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <ServiceDetailEnquiryCta locale={locale} image={ctaImage} />
    </div>
  );
}
