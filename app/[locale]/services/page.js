import Link from 'next/link';
import Image from 'next/image';
import {ArrowRight, Building2, Calculator, Car, CircuitBoard, ClipboardCheck, FileText, Flame, HardHat, Leaf, Route, Ruler, Sofa, Trees} from 'lucide-react';
import {services, serviceGroups} from '@/data/services';
import {generatedEditorialImages, serviceImages} from '@/data/image-manifest';
import {company, stats} from '@/data/company';
import {Container, CTA} from '@/components/UI';
import ServicesJumpNav from '@/components/services/ServicesJumpNav';

const featuredByGroup = {
  design: 'architectural-design',
  delivery: 'project-management',
  planning: 'infrastructure-urban-planning',
};

const groupCopy = {
  design: {
    en: 'Architecture, structure, electromechanical design, quantities, interiors and landscape from one office.',
    ar: 'العمارة والإنشاءات والتصميم الكهروميكانيكي والكميات والتصميم الداخلي والمناظر الطبيعية من مكتب واحد.',
  },
  delivery: {
    en: 'An integrated cycle from design and tender through construction, supervision and handover.',
    ar: 'دورة متكاملة من التصميم والعطاء إلى التنفيذ والإشراف والتسليم.',
  },
  planning: {
    en: 'Infrastructure, traffic, sustainability, technical studies and life-safety review supporting project approvals.',
    ar: 'البنية التحتية والمرور والاستدامة والدراسات الفنية ومراجعة السلامة لدعم اعتمادات المشروع.',
  },
};

const serviceIcons = {
  'architectural-design': Building2,
  'civil-structural-engineering': Ruler,
  'mep-engineering-design': CircuitBoard,
  'quantities-cost': Calculator,
  'interior-design': Sofa,
  'landscape-design': Trees,
  'project-management': ClipboardCheck,
  'construction-supervision': HardHat,
  'infrastructure-urban-planning': Route,
  'traffic-studies': Car,
  'sustainability-green-building': Leaf,
  'studies-specifications': FileText,
  'health-safety-fire-design': Flame,
};

function NextArrow({ar}) {
  return <ArrowRight size={16} className={ar ? 'reverse-arrow' : ''} />;
}

function ServiceIcon({slug}) {
  const Icon = serviceIcons[slug] || Building2;
  return <span className="services-icon" aria-hidden="true"><Icon size={20} /></span>;
}

function FeaturedService({service, locale, ar}) {
  return (
    <Link className="services-featured hp-card" href={`/${locale}/services/${service.slug}`}>
      <div className="services-featured-media">
        <Image src={serviceImages[service.slug]} alt="" fill sizes="(max-width: 900px) 100vw, 52vw" />
      </div>
      <div className="services-featured-copy">
        <ServiceIcon slug={service.slug} />
        <h3>{ar ? service.titleAr : service.title}</h3>
        <p>{ar ? service.descriptionAr : service.description}</p>
        <span className="atlas-link">
          {ar ? 'عرض الخدمة' : 'View service'}
          <NextArrow ar={ar} />
        </span>
      </div>
    </Link>
  );
}

function ServiceCard({service, locale, ar}) {
  return (
    <Link className="services-card hp-card" href={`/${locale}/services/${service.slug}`}>
      <ServiceIcon slug={service.slug} />
      <h3>{ar ? service.titleAr : service.title}</h3>
      <p>{ar ? service.descriptionAr : service.description}</p>
      <span className="atlas-link">
        {ar ? 'عرض الخدمة' : 'View service'}
        <NextArrow ar={ar} />
      </span>
    </Link>
  );
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  return {
    title: locale === 'ar' ? 'خدمات أساس الهندسية | أبوظبي' : 'Engineering Services | ASAS Abu Dhabi',
    description: locale === 'ar'
      ? 'خدمات أساس في التصميم والهندسة وإدارة المشاريع والإشراف والتخطيط.'
      : 'ASAS services across design, engineering, project management, supervision and planning.',
  };
}

export default async function Services({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  const bridgeStats = stats.slice(0, 3);

  return (
    <div className="services-index">
      <section className="services-hero">
        <div className="services-hero-photo" aria-hidden="true">
          <Image src={generatedEditorialImages.technicalCoordination} alt="" fill sizes="100vw" />
        </div>
        <Container>
          <span className="breadcrumb">ASAS / {ar ? 'الخدمات' : 'Services'}</span>
          <h1>{ar ? 'دراسات وتصاميم وإشراف عبر تخصصات المشروع.' : 'Studies, design and supervision across project disciplines.'}</h1>
          <p>{ar
            ? 'تغطي أساس الخدمات الهندسية والاستشارية من الدراسة والتصميم إلى العطاء والتنفيذ والتسليم.'
            : 'ASAS covers engineering and consultancy from studies and design through tender, construction and handover.'}</p>
          <div className="services-hero-meta">
            <span>{ar ? company.cityAr : company.city} · {company.year}</span>
            <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
          </div>
        </Container>
      </section>

      <ServicesJumpNav locale={locale} />

      {Object.entries(serviceGroups).map(([group, labels]) => {
        const items = services.filter((service) => service.group === group);
        const featuredSlug = featuredByGroup[group];
        const featured = items.find((service) => service.slug === featuredSlug) || items[0];
        const rest = items.filter((service) => service.slug !== featured.slug);
        const pairFeatured = group === 'delivery';
        const columns = group === 'planning' ? 2 : 3;

        return (
          <section className={`services-group services-group-${group}`} id={group} key={group}>
            <Container>
              <header className="services-group-head">
                <p className="atlas-kicker">{ar ? labels.ar : labels.en}</p>
                <h2>{ar ? groupCopy[group].ar : groupCopy[group].en}</h2>
              </header>

              {pairFeatured ? (
                <div className="services-featured-pair">
                  {items.map((service) => (
                    <FeaturedService service={service} locale={locale} ar={ar} key={service.slug} />
                  ))}
                </div>
              ) : (
                <>
                  <FeaturedService service={featured} locale={locale} ar={ar} />
                  {rest.length > 0 && (
                    <div className={`services-grid services-grid-${columns}`}>
                      {rest.map((service) => (
                        <ServiceCard service={service} locale={locale} ar={ar} key={service.slug} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </Container>
          </section>
        );
      })}

      <aside className="services-bridge">
        <Container className="services-bridge-inner">
          <p>{ar ? company.shortDescriptionAr : company.shortDescription}</p>
          <dl>
            {bridgeStats.map((item) => (
              <div key={item.label}>
                <dt>{ar ? item.labelAr : item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </aside>

      <CTA locale={locale} />
    </div>
  );
}
