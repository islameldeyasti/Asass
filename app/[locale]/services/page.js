import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Building2,
  Calculator,
  Car,
  CheckCircle2,
  CircuitBoard,
  ClipboardCheck,
  FileText,
  Flame,
  Globe2,
  HardHat,
  Leaf,
  MessageSquare,
  PenLine,
  Route,
  Ruler,
  Sofa,
  Trees,
  TrendingUp,
} from 'lucide-react';
import {services, serviceGroups} from '@/data/services';
import {getServiceImage, roleImages, ctaBandImages} from '@/data/image-manifest';
import {company, stats} from '@/data/company';
import ServicesJumpNav from '@/components/services/ServicesJumpNav';
import ServicesEnquiryCta from '@/components/services/ServicesEnquiryCta';

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

const designValuePoints = [
  {
    Icon: Building2,
    en: 'Multidisciplinary expertise',
    ar: 'خبرات متعددة التخصصات',
  },
  {
    Icon: Leaf,
    en: 'Sustainable design approach',
    ar: 'نهج تصميم مستدام',
  },
  {
    Icon: Globe2,
    en: 'International standards',
    ar: 'معايير دولية',
  },
  {
    Icon: TrendingUp,
    en: 'Value-driven solutions',
    ar: 'حلول مدفوعة بالقيمة',
  },
];

const approachSteps = [
  {
    number: '01',
    Icon: MessageSquare,
    en: ['Understand', 'We begin by understanding client goals, site constraints and intended use.'],
    ar: ['الفهم', 'نبدأ بفهم أهداف العميل وقيود الموقع والاستخدام المقصود.'],
  },
  {
    number: '02',
    Icon: PenLine,
    en: ['Design', 'Develop coordinated architectural, structural and electromechanical solutions.'],
    ar: ['التصميم', 'نطوّر حلولاً منسقة معمارياً وإنشائياً وكهروميكانيكياً.'],
  },
  {
    number: '03',
    Icon: HardHat,
    en: ['Deliver', 'Support through tender, construction supervision and handover.'],
    ar: ['التنفيذ', 'ندعم عبر العطاء والإشراف الموقعي والتسليم.'],
  },
  {
    number: '04',
    Icon: CheckCircle2,
    en: ['Create Value', 'Deliver efficient, lasting engineering with value-focused review.'],
    ar: ['خلق القيمة', 'نقدّم هندسة فعّالة ومستدامة مع مراجعة مركّزة على القيمة.'],
  },
];

const sectionTitles = {
  design: {
    en: 'Integrated engineering solutions from concept to reality.',
    ar: 'حلول هندسية متكاملة من الفكرة إلى الواقع.',
  },
  delivery: {
    en: 'An integrated cycle from design and tender through construction, supervision and handover.',
    ar: 'دورة متكاملة من التصميم والعطاء إلى التنفيذ والإشراف والتسليم.',
  },
  planning: {
    en: 'Specialist studies for smarter, more sustainable communities.',
    ar: 'دراسات متخصصة لمجتمعات أذكى وأكثر استدامة.',
  },
};

const sectionLeads = {
  design: {
    en: 'Architecture, structure, electromechanical design, quantities, interiors and landscape from one Abu Dhabi office.',
    ar: 'العمارة والإنشاءات والتصميم الكهروميكانيكي والكميات والتصميم الداخلي والمناظر الطبيعية من مكتب واحد في أبوظبي.',
  },
  delivery: {
    en: company.description,
    ar: company.descriptionAr,
  },
  planning: {
    en: 'Infrastructure, traffic, sustainability, technical studies and life-safety review supporting project approvals.',
    ar: 'البنية التحتية والمرور والاستدامة والدراسات الفنية ومراجعة السلامة لدعم اعتمادات المشروع.',
  },
};

function NextArrow({ar}) {
  return <ArrowRight size={15} className={ar ? 'reverse-arrow' : ''} />;
}

function ServiceIcon({slug}) {
  const Icon = serviceIcons[slug] || Building2;
  return (
    <span className="sv-icon" aria-hidden="true">
      <Icon size={18} />
    </span>
  );
}

function ServiceCard({service, locale, ar}) {
  const {src, imagePosition} = getServiceImage(service.slug);
  return (
    <Link className="sv-card" href={`/${locale}/services/${service.slug}`}>
      <div className="sv-card-media">
        <div
          className={`sv-card-media-frame${src ? '' : ' sv-card-media-frame--tone'}`}
          aria-hidden="true"
        >
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
              style={{objectFit: 'cover', objectPosition: imagePosition}}
            />
          ) : null}
        </div>
        <ServiceIcon slug={service.slug} />
      </div>
      <div className="sv-card-copy">
        <h3>{ar ? service.titleAr : service.title}</h3>
        <p>{ar ? service.descriptionAr : service.description}</p>
        <span className="sv-card-link">
          {ar ? 'عرض الخدمة' : 'View service'}
          <NextArrow ar={ar} />
        </span>
      </div>
    </Link>
  );
}

function DeliveryCard({service, locale, ar}) {
  const {src, imagePosition} = getServiceImage(service.slug);
  return (
    <Link className="sv-delivery-card" href={`/${locale}/services/${service.slug}`}>
      <div
        className={`sv-delivery-media${src ? '' : ' sv-delivery-media--tone'}`}
        aria-hidden="true"
      >
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
            style={{objectFit: 'cover', objectPosition: imagePosition}}
          />
        ) : null}
      </div>
      <div className="sv-delivery-copy">
        <ServiceIcon slug={service.slug} />
        <h3>{ar ? service.titleAr : service.title}</h3>
        <p>{ar ? service.descriptionAr : service.description}</p>
        <span className="sv-card-link">
          {ar ? 'عرض الخدمة' : 'View service'}
          <NextArrow ar={ar} />
        </span>
      </div>
    </Link>
  );
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  return {
    title: locale === 'ar' ? 'خدمات أساس للاستشارات الهندسية وإدارة المشاريع الهندسية | أبوظبي' : 'Engineering Services | ASAS Abu Dhabi',
    description: locale === 'ar'
      ? 'خدمات أساس للاستشارات الهندسية وإدارة المشاريع في التصميم والهندسة وإدارة المشاريع والإشراف والتخطيط.'
      : 'ASAS services across design, engineering, project management, supervision and planning.',
  };
}

export default async function Services({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  const designServices = services.filter((service) => service.group === 'design');
  const deliveryServices = services.filter((service) => service.group === 'delivery');
  const planningServices = services.filter((service) => service.group === 'planning');
  const planningFeatured =
    planningServices.find((service) => service.slug === 'infrastructure-urban-planning') || planningServices[0];
  const planningRest = planningServices.filter((service) => service.slug !== planningFeatured.slug);
  const planningFeaturedImage = getServiceImage(planningFeatured.slug);
  const metrics = stats;
  const ctaImage = {src: ctaBandImages.services, crop: '50% 40%'};

  return (
    <div className="sv">
      <section className="sv-hero">
        <div className="sv-hero-media" aria-hidden="true">
          <Image src={roleImages.SERVICES_HERO} alt="" fill priority sizes="100vw" />
        </div>
        <div className="sv-hero-veil" aria-hidden="true" />
        <svg className="sv-hero-blueprint" viewBox="0 0 320 520" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M40 40 V480" />
            <path d="M80 70 V450" />
            <path d="M120 100 V420" />
            <path d="M160 130 V390" />
            <path d="M40 160 H200" />
            <path d="M40 240 H180" />
            <path d="M40 320 H160" />
            <circle cx="40" cy="160" r="3" fill="#a02315" stroke="none" />
          </g>
        </svg>
        <div className="sv-shell sv-hero-inner">
          <div className="sv-hero-copy">
            <p className="sv-kicker light">
              <i />
              {ar ? 'أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS'} / {ar ? 'الخدمات' : 'Services'}
            </p>
            <h1>
              {ar ? (
                <>
                  <span>دراسات وتصاميم</span>
                  <span>وإشراف عبر</span>
                  <span>تخصصات المشروع.</span>
                </>
              ) : (
                <>
                  <span>Studies, design and</span>
                  <span>supervision across</span>
                  <span>project disciplines.</span>
                </>
              )}
            </h1>
            <p className="sv-hero-lede">
              {ar
                ? 'تغطي أساس للاستشارات الهندسية وإدارة المشاريع الخدمات الهندسية والاستشارية من الدراسة والتصميم إلى العطاء والتنفيذ والتسليم.'
                : 'ASAS covers engineering and consultancy from studies and design through tender, construction and handover.'}
            </p>
            <div className="sv-hero-meta">
              <span>{ar ? company.cityAr : company.city}</span>
              <span aria-hidden="true">·</span>
              <span>{company.year}</span>
              <span aria-hidden="true">|</span>
              <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
            </div>
          </div>
          <ul className="sv-hero-words" aria-hidden="true">
            <li>{ar ? 'أشخاص' : 'People'}</li>
            <li>{ar ? 'أماكن' : 'Places'}</li>
            <li>{ar ? 'إمكانات' : 'Possibilities'}</li>
            <li>{ar ? 'غدٍ' : 'A Better'}</li>
            <li>{ar ? 'أفضل' : 'Tomorrow'}</li>
          </ul>
        </div>
      </section>

      <ServicesJumpNav locale={locale} />

      <section className="sv-section sv-design" id="design">
        <div className="sv-shell sv-design-grid">
          <div className="sv-design-copy">
            <p className="sv-kicker">
              <i />
              {ar ? serviceGroups.design.ar : serviceGroups.design.en}
            </p>
            <h2>{ar ? sectionTitles.design.ar : sectionTitles.design.en}</h2>
            <p>{ar ? sectionLeads.design.ar : sectionLeads.design.en}</p>
            <ul className="sv-values">
              {designValuePoints.map(({Icon, en, ar: labelAr}) => (
                <li key={en}>
                  <Icon size={16} aria-hidden="true" />
                  <span>{ar ? labelAr : en}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="sv-card-grid sv-card-grid-3">
            {designServices.map((service) => (
              <ServiceCard key={service.slug} service={service} locale={locale} ar={ar} />
            ))}
          </div>
        </div>
      </section>

      <section className="sv-section sv-delivery" id="delivery">
        <div className="sv-shell">
          <header className="sv-section-head">
            <p className="sv-kicker">
              <i />
              {ar ? serviceGroups.delivery.ar : serviceGroups.delivery.en}
            </p>
            <h2>{ar ? sectionTitles.delivery.ar : sectionTitles.delivery.en}</h2>
            <p>{ar ? sectionLeads.delivery.ar : sectionLeads.delivery.en}</p>
          </header>
          <div className="sv-delivery-grid">
            {deliveryServices.map((service) => (
              <DeliveryCard key={service.slug} service={service} locale={locale} ar={ar} />
            ))}
          </div>
        </div>
      </section>

      <section className="sv-section sv-planning" id="planning">
        <div className="sv-shell">
          <header className="sv-section-head">
            <p className="sv-kicker">
              <i />
              {ar ? serviceGroups.planning.ar : serviceGroups.planning.en}
            </p>
            <h2>{ar ? sectionTitles.planning.ar : sectionTitles.planning.en}</h2>
            <p>{ar ? sectionLeads.planning.ar : sectionLeads.planning.en}</p>
          </header>

          <Link className="sv-planning-feature" href={`/${locale}/services/${planningFeatured.slug}`}>
            <div
              className={`sv-planning-feature-media${planningFeaturedImage.src ? '' : ' sv-planning-feature-media--tone'}`}
              aria-hidden="true"
            >
              {planningFeaturedImage.src ? (
                <Image
                  src={planningFeaturedImage.src}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 60vw"
                  style={{objectFit: 'cover', objectPosition: planningFeaturedImage.imagePosition}}
                />
              ) : null}
            </div>
            <div className="sv-planning-feature-copy">
              <ServiceIcon slug={planningFeatured.slug} />
              <h3>{ar ? planningFeatured.titleAr : planningFeatured.title}</h3>
              <p>{ar ? planningFeatured.descriptionAr : planningFeatured.description}</p>
              <span className="sv-card-link">
                {ar ? 'عرض الخدمة' : 'View service'}
                <NextArrow ar={ar} />
              </span>
            </div>
          </Link>

          <div className="sv-card-grid sv-card-grid-4">
            {planningRest.map((service) => (
              <ServiceCard key={service.slug} service={service} locale={locale} ar={ar} />
            ))}
          </div>
        </div>
      </section>

      <section className="sv-metrics">
        <div className="sv-shell sv-metrics-inner">
          <dl className="sv-metrics-grid">
            {metrics.map((item) => (
              <div key={item.label} className="sv-metric">
                <dt className="ltr-isolate" dir="ltr">{item.value}</dt>
                <dd>{ar ? item.labelAr : item.label}</dd>
              </div>
            ))}
          </dl>
          <div className="sv-metrics-side" aria-hidden="true">
            <svg viewBox="0 0 180 280" className="sv-metrics-blueprint">
              <g fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M40 250 V40 H70 V250" />
                <path d="M86 250 V28 H120 V250" />
                <path d="M136 250 V52 H166 V250" />
                <path d="M30 250 H176" />
                <path d="M40 120 H166" />
                <path d="M40 170 H166" />
                <path d="M52 70 H58 M98 55 H106 M148 80 H156" />
              </g>
            </svg>
            <ul className="sv-metrics-words">
              {(ar
                ? ['مبنية على', 'الخبرة', 'مدفوعة', 'بغدٍ أفضل']
                : ['Built on', 'Expertise', 'Driven by', 'A Better', 'Tomorrow']
              ).map((word) => (
                <li key={word}>{word}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="sv-section sv-approach">
        <div className="sv-shell sv-approach-grid">
          <header className="sv-approach-copy">
            <p className="sv-kicker">
              <i />
              {ar ? 'منهجيتنا' : 'Our Approach'}
            </p>
            <h2>
              {ar ? (
                <>
                  من الرؤية إلى
                  <br />
                  أثر واقعي.
                </>
              ) : (
                <>
                  From vision to
                  <br />
                  real-world impact.
                </>
              )}
            </h2>
          </header>
          <ol className="sv-steps">
            {approachSteps.map((step, index) => {
              const Icon = step.Icon;
              const [title, copy] = ar ? step.ar : step.en;
              return (
                <li key={step.number}>
                  <span className="sv-step-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <span className="sv-step-num">{step.number}</span>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                  {index < approachSteps.length - 1 && <i className="sv-step-line" aria-hidden="true" />}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <ServicesEnquiryCta locale={locale} image={ctaImage} />
    </div>
  );
}
