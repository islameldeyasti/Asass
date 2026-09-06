import Link from 'next/link';
import Image from 'next/image';
import HomeContactForm from '@/components/HomeContactForm';
import ServicesTabs from '@/components/home/ServicesTabs';
import HeroSlider from '@/components/home/HeroSlider';
import SectorShowcase from '@/components/home/SectorShowcase';
import {whyIcons} from '@/components/icons/WhyIcons';
import {ArrowRight, ArrowUpRight, Mail, MapPin, MessageCircle, Phone} from 'lucide-react';
import {company} from '@/data/company';
import {featuredServices} from '@/data/services';
import {projects} from '@/data/projects';
import {projectLifecycle} from '@/data/method';
import {generatedEditorialImages, sectorImages} from '@/data/image-manifest';

const featuredProject = projects.find((project) => project.slug === 'four-towers-al-nahda');
const portfolioGridSlugs = [
  'culture-private-school',
  'compound-villas-portfolio',
  'residential-villa-al-shamkha-sh3',
  'reception-hall-private-villa',
];
const portfolioGrid = portfolioGridSlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter(Boolean);
const phases = projectLifecycle;

const heroSlides = [
  {
    id: 'four-towers',
    slug: 'four-towers-al-nahda',
    image: generatedEditorialImages.homepageHero,
    crop: '68% 38%',
    strip: 'Four Towers',
    stripAr: 'أربعة أبراج',
    location: 'Al Nahda, Sharjah',
    locationAr: 'النهدة، الشارقة',
    title: 'Four Towers, Al Nahda',
    titleAr: 'أربعة أبراج، النهدة',
    note: 'A four-tower composition over a shared podium with coordinated architectural, structural and electromechanical design.',
    noteAr: 'تكوين من أربعة أبراج فوق منصة مشتركة بتصميم معماري وإنشائي وكهروميكانيكي منسّق.',
    facts: [['Towers', '4'], ['Floors', '37'], ['Scope', 'A / S / MEP']],
    factsAr: [['أبراج', '4'], ['طوابق', '37'], ['النطاق', 'A / S / MEP']],
  },
  {
    id: 'traffic',
    slug: 'traffic-access-studies',
    image: projects.find((p) => p.slug === 'traffic-access-studies')?.visual?.src || generatedEditorialImages.technicalCoordination,
    crop: '50% 50%',
    strip: 'Infrastructure',
    stripAr: 'بنية تحتية',
    location: 'Khalifa City, Abu Dhabi',
    locationAr: 'مدينة خليفة، أبوظبي',
    title: 'Traffic & Access Studies',
    titleAr: 'دراسات المرور والمداخل',
    note: 'Parking, circulation and municipality-review documentation from the official ASAS portfolio.',
    noteAr: 'مواقف وحركة وتوثيق مراجعة البلدية من أعمال أساس الرسمية.',
    facts: [['Sector', 'Infrastructure'], ['Focus', 'Access & parking'], ['Type', 'Planning study']],
    factsAr: [['القطاع', 'البنية التحتية'], ['التركيز', 'المداخل والمواقف'], ['النوع', 'دراسة تخطيطية']],
  },
  {
    id: 'school',
    slug: 'culture-private-school',
    image: generatedEditorialImages.educationSector,
    crop: '35% 40%',
    strip: 'Education',
    stripAr: 'تعليم',
    location: 'Abu Dhabi',
    locationAr: 'أبوظبي',
    title: 'Culture Private School',
    titleAr: 'مدرسة الثقافة الخاصة',
    note: 'Campus master planning and educational facilities within the ASAS selected portfolio.',
    noteAr: 'تخطيط الحرم والمرافق التعليمية ضمن أعمال أساس المختارة.',
    facts: [['Sector', 'Education'], ['Scope', 'Planning & design'], ['Office', 'Abu Dhabi']],
    factsAr: [['القطاع', 'التعليم'], ['النطاق', 'تخطيط وتصميم'], ['المكتب', 'أبوظبي']],
  },
  {
    id: 'compounds',
    slug: 'compound-villas-portfolio',
    image: generatedEditorialImages.villasSector,
    crop: '55% 45%',
    strip: 'Residential',
    stripAr: 'سكني',
    location: 'Khalifa City, Abu Dhabi',
    locationAr: 'مدينة خليفة، أبوظبي',
    title: 'Compound Villas Portfolio',
    titleAr: 'مجموعة مشاريع مجمعات الفلل',
    note: 'Multi-unit villa compounds planned as one architectural family with shared access and services.',
    noteAr: 'مجمعات فلل متعددة الوحدات كعائلة معمارية واحدة مع مداخل وخدمات مشتركة.',
    facts: [['Sector', 'Compounds'], ['Scope', 'Architecture'], ['Office', 'Abu Dhabi']],
    factsAr: [['القطاع', 'المجمعات'], ['النطاق', 'عمارة'], ['المكتب', 'أبوظبي']],
  },
  {
    id: 'interiors',
    slug: 'reception-hall-private-villa',
    image: generatedEditorialImages.interiorsSector,
    crop: '40% 50%',
    strip: 'Interiors',
    stripAr: 'داخلي',
    location: 'Abu Dhabi',
    locationAr: 'أبوظبي',
    title: 'Reception Hall — Private Villa',
    titleAr: 'قاعة استقبال — فيلا خاصة',
    note: 'Residential reception interiors with classical detailing from the ASAS hospitality portfolio.',
    noteAr: 'تصميم داخلي لقاعة استقبال سكنية بتفاصيل كلاسيكية من أعمال أساس.',
    facts: [['Sector', 'Interiors'], ['Type', 'Interior fit-out'], ['Office', 'Abu Dhabi']],
    factsAr: [['القطاع', 'التصميم الداخلي'], ['النوع', 'تجهيز داخلي'], ['المكتب', 'أبوظبي']],
  },
];

const sectorCards = [
  {key: 'towers-high-rise', image: sectorImages['towers-high-rise'], label: 'Towers', labelAr: 'الأبراج', title: 'Towers & high-rise', titleAr: 'الأبراج والمباني العالية', copy: 'Architectural, structural and electromechanical design', copyAr: 'تصميم معماري وإنشائي وكهروميكانيكي', tone: 'dark'},
  {key: 'commercial-residential-buildings', image: sectorImages['commercial-residential-buildings'], label: 'Buildings', labelAr: 'المباني', title: 'Commercial & residential', titleAr: 'التجاري والسكني', copy: 'Building design across coordinated disciplines', copyAr: 'تصميم مبانٍ عبر تخصصات منسقة', tone: 'dark'},
  {key: 'infrastructure-urban-planning', image: sectorImages['infrastructure-urban-planning'], label: 'Infrastructure', labelAr: 'البنية التحتية', title: 'Infrastructure & planning', titleAr: 'البنية التحتية والتخطيط', copy: 'Traffic, access, parking and municipality review', copyAr: 'المرور والمداخل والمواقف ومراجعة البلدية', tone: 'light'},
  {key: 'education', image: sectorImages.education, label: 'Education', labelAr: 'التعليم', title: 'Schools', titleAr: 'المدارس', copy: 'Campus planning and educational facilities', copyAr: 'تخطيط الحرم والمرافق التعليمية', tone: 'light'},
  {key: 'villas-compounds-palaces', image: sectorImages['villas-compounds-palaces'], label: 'Residential', labelAr: 'السكني', title: 'Villas & compounds', titleAr: 'الفلل والمجمعات', copy: 'Private villas, residential villas and compounds', copyAr: 'فلل خاصة وسكنية ومجمعات', tone: 'dark'},
  {key: 'interior-hospitality-retail', image: sectorImages['interior-hospitality-retail'], label: 'Interiors', labelAr: 'التصميم الداخلي', title: 'Interior design', titleAr: 'التصميم الداخلي', copy: 'Residential, hospitality and retail interiors', copyAr: 'تصميمات سكنية وضيافة وتجزئة', tone: 'dark'},
];

const content = {
  en: {
    eyebrow: 'Established in Abu Dhabi · 2009',
    hero: 'From Sketch to Final Handover.',
    lede: 'Architecture, structure, electromechanical services, quantity surveying, project management and site supervision in one consultancy.',
    start: 'Start a project', work: 'View our work', journey: 'Project lifecycle',
    sectorEyebrow: 'Project sectors',
    sectorTitle: 'Projects across diverse sectors.',
    sectorCopy: 'Project experience across the building types and environments represented in the ASAS portfolio.',
    sectorCta: 'View all sectors',
    processEyebrow: 'Project lifecycle', processTitle: 'From concept to financial closure', processCopy: 'A documented route through design, award, construction, handover and future phases.',
    archive: 'Selected work', archiveTitle: 'Projects from the official ASAS portfolio', archiveCopy: 'A featured project with supporting work across towers, infrastructure, education, compounds and interiors.', archiveCta: 'View all projects',
    featured: 'Selected project', dossier: [['Composition', '3B + 6 podium'], ['Parking', '6 levels'], ['Height', '37 floors'], ['Location', 'Sharjah, Al Nahda']],
  },
  ar: {
    eyebrow: 'تأسست في أبوظبي · 2009',
    hero: 'من الرسم إلى التسليم النهائي.',
    lede: 'العمارة والإنشاءات والأعمال الكهروميكانيكية وحصر الكميات وإدارة المشاريع والإشراف الموقعي في مكتب استشاري واحد.',
    start: 'ابدأ مشروعك', work: 'استكشف أعمالنا', journey: 'دورة حياة المشروع',
    sectorEyebrow: 'قطاعات المشاريع',
    sectorTitle: 'مشاريع عبر قطاعات متعددة.',
    sectorCopy: 'خبرة عبر أنواع وبيئات المشاريع الواردة في أعمال أساس.',
    sectorCta: 'عرض كل القطاعات',
    processEyebrow: 'دورة حياة المشروع', processTitle: 'من الفكرة إلى الإغلاق المالي', processCopy: 'مسار موثق يمر بالتصميم والترسية والتنفيذ والتسليم والمراحل المستقبلية.',
    archive: 'أعمال مختارة', archiveTitle: 'مشاريع من الملف الرسمي لأساس', archiveCopy: 'مشروع مختار مع أعمال داعمة عبر الأبراج والبنية التحتية والتعليم والمجمعات والتصميم الداخلي.', archiveCta: 'عرض كل المشاريع',
    featured: 'مشروع مختار', dossier: [['التكوين', '3 طوابق سفلية + 6 منصة'], ['المواقف', '6 طوابق'], ['الارتفاع', '37 طابقاً'], ['الموقع', 'الشارقة، النهدة']],
  },
};

const whyPoints = {
  en: [
    ['Cross-discipline checking', 'Drawings, specifications and bills of quantities are checked across disciplines before issue.'],
    ['Timely reporting', 'Scheduled progress, cost and quality reports support the project lifecycle.'],
    ['Integrated project cycle', 'Primary design, final design, tender and construction are managed as one connected cycle.'],
    ['Records and commitment', 'Project records are retained and remain available to clients after handover.'],
  ],
  ar: [
    ['مراجعة بين التخصصات', 'تُراجع الرسومات والمواصفات وجداول الكميات بين التخصصات قبل الإصدار.'],
    ['تقارير في مواعيدها', 'تدعم تقارير التقدم والتكلفة والجودة المجدولة دورة حياة المشروع.'],
    ['دورة مشروع متكاملة', 'تُدار مراحل التصميم الأولي والنهائي والعطاء والتنفيذ كدورة مترابطة.'],
    ['السجلات والالتزام', 'تُحفظ سجلات المشروع وتظل متاحة للعملاء بعد التسليم.'],
  ],
};

const faqs = {
  en: [
    ['What engineering services does ASAS provide?', 'ASAS provides architectural, structural, civil and electromechanical design, quantity and cost services, project management, construction supervision, infrastructure, traffic studies, urban planning, sustainability and interior design.'],
    ['What project sectors does ASAS work across?', 'The portfolio includes towers, commercial and residential buildings, industrial facilities, infrastructure, schools, villas, compounds and interiors.'],
    ['Does ASAS provide both design and supervision?', 'Yes. ASAS provides coordinated design services and resident engineering and site supervision through construction and handover.'],
    ['Where is the ASAS office?', 'The office is in Musaffah East 9, Abu Dhabi, behind Safeer Mall, in ADCP Building No. P1239.'],
    ['How does a project progress with ASAS?', 'The documented lifecycle covers concept and brief, design, tender, construction, snagging, final handover, financial closure and future phases.'],
  ],
  ar: [
    ['ما الخدمات الهندسية التي تقدمها أساس؟', 'تقدم أساس التصميم المعماري والإنشائي والمدني والكهروميكانيكي، وخدمات الكميات والتكلفة، وإدارة المشاريع والإشراف، والبنية التحتية ودراسات المرور والتخطيط الحضري والاستدامة والتصميم الداخلي.'],
    ['ما القطاعات التي تعمل فيها أساس؟', 'تشمل الأعمال الأبراج والمباني التجارية والسكنية والمنشآت الصناعية والبنية التحتية والمدارس والفلل والمجمعات والتصميم الداخلي.'],
    ['هل تقدم أساس التصميم والإشراف؟', 'نعم. تقدم أساس خدمات تصميم منسقة وهندسة مقيمة وإشرافاً موقعياً خلال التنفيذ والتسليم.'],
    ['أين يقع مكتب أساس؟', 'يقع المكتب في مصفح شرق 9 في أبوظبي، خلف سفير مول، في مبنى ADCP رقم P1239.'],
    ['كيف يتقدم المشروع مع أساس؟', 'تشمل دورة الحياة الموثقة الفكرة والموجز والتصميم والعطاء والتنفيذ وحصر الملاحظات والتسليم النهائي والإغلاق المالي والمراحل المستقبلية.'],
  ],
};

function NextArrow({ar}) { return <ArrowRight className={ar ? 'reverse-arrow' : ''}/>; }

export async function generateMetadata({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  return {
    title: ar ? 'أساس للاستشارات الهندسية وإدارة المشاريع | أبوظبي' : 'ASAS Engineering & Project Management Consultancy | Abu Dhabi',
    description: ar ? company.descriptionAr : company.description,
  };
}

export default async function Home({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  const t = content[ar ? 'ar' : 'en'];
  const url = (path) => `/${locale}/${path}`;

  return <div className="asas-home atlas-home hp-revised">
    <HeroSlider locale={locale} slides={heroSlides} />

    <section className="hp-about">
      <div className="home-shell hp-about-layout">
        <div className="hp-about-visual">
          <Image src={generatedEditorialImages.corporateTeam} alt="" width={1280} height={960} />
        </div>
        <div className="hp-about-copy">
          <p className="atlas-kicker">{ar ? 'عن ASAS' : 'About us'}</p>
          <h2>{ar ? 'استشارات هندسية من أبوظبي منذ 2009.' : 'Abu Dhabi engineering consultancy since 2009.'}</h2>
          <p className="hp-about-lede">{ar ? company.descriptionAr : company.description}</p>
          <p className="hp-about-note">{ar ? company.shortDescriptionAr : company.shortDescription}</p>
          <div className="hp-about-actions">
            <Link className="atlas-link" href={url('about')}>{ar ? 'اعرف المزيد عنا' : 'Learn more about us'}<NextArrow ar={ar}/></Link>
            <Link className="atlas-link" href="/downloads/asas-company-profile.pdf">{ar ? 'الملف التعريفي' : 'Company profile'}<NextArrow ar={ar}/></Link>
          </div>
        </div>
      </div>
    </section>

    <ServicesTabs locale={locale} services={featuredServices} />

    <SectorShowcase
      locale={locale}
      cards={sectorCards}
      eyebrow={t.sectorEyebrow}
      title={t.sectorTitle}
      copy={t.sectorCopy}
      cta={t.sectorCta}
    />

    <section className="wf-process">
      <div className="home-shell wf-process-grid">
        <div className="wf-process-copy">
          <p className="atlas-kicker">{t.processEyebrow}</p>
          <h2>{t.processTitle}<span className="title-dot">.</span></h2>
          <p>{t.processCopy}</p>
        </div>
        <ol className="wf-process-list">
          {phases.map((phase) => (
            <li key={phase.number}>
              <span>{phase.number}</span>
              <div>
                <h3>{ar ? phase.titleAr : phase.title}</h3>
                <p>{ar ? phase.copyAr : phase.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="hp-portfolio" id="work">
      <div className="home-shell">
        <div className="hp-portfolio-head">
          <div>
            <p className="atlas-kicker">{t.archive}</p>
            <h2>{t.archiveTitle}</h2>
            <p>{t.archiveCopy}</p>
          </div>
          <Link className="atlas-link" href={url('projects')}>{t.archiveCta}<NextArrow ar={ar}/></Link>
        </div>

        {featuredProject && (
          <article className="hp-featured hp-card">
            <div className="hp-featured-visual">
              <Image
                src={featuredProject.visual.src}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
                style={{objectPosition: featuredProject.visual.crop}}
                priority
              />
            </div>
            <div className="hp-featured-copy">
              <p className="atlas-kicker">{t.featured}</p>
              <h3>{ar ? featuredProject.titleAr : featuredProject.title}</h3>
              <p>{ar ? featuredProject.descriptionAr : featuredProject.description}</p>
              <dl>
                {t.dossier.map(([label, value]) => (
                  <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                ))}
              </dl>
              <Link className="atlas-link" href={url(`projects/${featuredProject.slug}`)}>
                {ar ? 'عرض المشروع' : 'View project'}
                <NextArrow ar={ar}/>
              </Link>
            </div>
          </article>
        )}

        <div className="hp-portfolio-grid">
          {portfolioGrid.map((project, index) => {
            const photo = project.visual?.classification === 'PROJECT_PHOTO';
            return (
              <article className="hp-portfolio-card hp-card" key={project.slug}>
                <div className="hp-portfolio-media">
                  <Image
                    src={project.visual.src}
                    alt={photo ? (ar ? project.titleAr : project.title) : ''}
                    fill
                    sizes="(max-width: 900px) 50vw, 25vw"
                    style={{objectPosition: project.visual.crop}}
                  />
                </div>
                <div className="hp-portfolio-meta">
                  <small>0{index + 1}</small>
                  <h3>{ar ? project.titleAr : project.title}</h3>
                  <p>{project.locationShort
                    ? (ar ? project.locationShortAr : project.locationShort)
                    : (ar ? project.descriptionAr : project.description)}</p>
                  <Link className="atlas-link" href={url(`projects/${project.slug}`)}>
                    {ar ? 'عرض المشروع' : 'View project'}
                    <NextArrow ar={ar}/>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>

    <section className="hp-why">
      <div className="home-shell">
        <div className="hp-why-head">
          <p className="atlas-kicker">{ar ? 'لماذا ASAS' : 'Why ASAS'}</p>
          <h2>{ar ? 'لماذا يختار العملاء ASAS.' : 'Why clients choose ASAS.'}</h2>
          <p>{ar ? 'جودة المخرجات والتقارير في مواعيدها وعلاقة عمل تستمر بعد التسليم.' : 'Quality output, timely reporting and a working relationship that continues after handover.'}</p>
        </div>
        <div className="hp-why-grid">
          {whyPoints[ar ? 'ar' : 'en'].map(([title, text], index) => {
            const Icon = whyIcons[index];
            return (
              <article className="hp-card" key={title}>
                <span className="hp-why-badge"><Icon size={28} /></span>
                <small>0{index + 1}</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            );
          })}
        </div>
        <aside className="hp-why-bridge">
          <p>{ar
            ? 'مكتب استشاري واحد في أبوظبي يغطي التصميم والإشراف من الفكرة إلى التسليم.'
            : 'One Abu Dhabi consultancy covering design and supervision from concept to handover.'}</p>
        </aside>
      </div>
    </section>

    <section className="home-contact" id="contact">
      <div className="home-shell">
        <div className="home-contact-head">
          <p className="atlas-kicker center">{ar ? 'تواصل معنا' : 'Get in touch'}</p>
          <h2>{ar ? 'لنناقش مشروعك.' : 'Let’s discuss your project.'}</h2>
          <p>{ar
            ? 'هل أنت مستعد لبدء مشروعك الهندسي القادم؟ تواصل مع فريق ASAS.'
            : 'Ready to start your next engineering project? Contact the ASAS team.'}</p>
        </div>
        <div className="home-contact-layout">
          <div className="home-contact-details">
            <article>
              <MapPin aria-hidden="true" />
              <div>
                <h3>{ar ? 'زورونا' : 'Visit us'}</h3>
                <p>{ar ? company.addressAr : company.address}</p>
              </div>
            </article>
            <article>
              <Phone aria-hidden="true" />
              <div>
                <h3>{ar ? 'اتصل بنا' : 'Call us'}</h3>
                <a href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a>
              </div>
            </article>
            <article>
              <MessageCircle aria-hidden="true" />
              <div>
                <h3>WhatsApp</h3>
                <a href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noreferrer">{ar ? 'تواصل مع ASAS' : 'Message ASAS'}</a>
              </div>
            </article>
            <article>
              <Mail aria-hidden="true" />
              <div>
                <h3>{ar ? 'البريد الإلكتروني' : 'Email'}</h3>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </div>
            </article>
          </div>
          <HomeContactForm locale={locale} />
        </div>
      </div>
    </section>

    <section className="hp-faq" id="faq">
      <div className="home-shell hp-faq-grid">
        <div className="hp-faq-intro">
          <p className="atlas-kicker">{ar ? 'أسئلة' : 'Questions'}</p>
          <h2>{ar ? 'بدء مشروع مع ASAS.' : 'Starting a project with ASAS.'}</h2>
        </div>
        <div className="hp-faq-list">
          {faqs[ar ? 'ar' : 'en'].map(([question, answer], index) => (
            <details key={question}>
              <summary>
                <span className="hp-faq-num">0{index + 1}</span>
                <span className="hp-faq-q">{question}</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  </div>;
}
