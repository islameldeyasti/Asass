import Link from 'next/link';
import Image from 'next/image';
import {ArrowRight, Building2, ClipboardList, FileText, FolderKanban, Layers} from 'lucide-react';
import {Container} from '@/components/UI';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import {company} from '@/data/company';
import {companyDocumentImage, roleImages} from '@/data/image-manifest';

const PROFILE_HREF = '/downloads/asas-company-profile.pdf';
const PROFILE_SIZE = '7.7 MB';

const profileContents = [
  {
    icon: Building2,
    title: 'Firm overview',
    titleAr: 'نظرة على الشركة',
    copy: 'Founding year, Abu Dhabi base and Mir Group context.',
    copyAr: 'سنة التأسيس ومقر أبوظبي وسياق مجموعة مير.',
  },
  {
    icon: Layers,
    title: 'Capabilities',
    titleAr: 'القدرات',
    copy: 'Architecture, structure, MEP, quantities and supervision.',
    copyAr: 'العمارة والإنشاءات والكهروميكانيكية والكميات والإشراف.',
  },
  {
    icon: ClipboardList,
    title: 'Methodology',
    titleAr: 'المنهجية',
    copy: 'Documented project lifecycle from brief to handover.',
    copyAr: 'دورة حياة موثّقة للمشروع من الموجز إلى التسليم.',
  },
  {
    icon: FolderKanban,
    title: 'Selected work',
    titleAr: 'أعمال مختارة',
    copy: 'Portfolio examples across ASAS project sectors.',
    copyAr: 'أمثلة من الأعمال عبر قطاعات مشاريع أساس للاستشارات الهندسية وإدارة المشاريع.',
  },
];

const relatedLinks = [
  {
    href: 'about',
    label: 'About ASAS',
    labelAr: 'عن أساس للاستشارات الهندسية وإدارة المشاريع',
    copy: 'Company background and how the office works.',
    copyAr: 'خلفية الشركة وكيف يعمل المكتب.',
  },
  {
    href: 'services',
    label: 'Services',
    labelAr: 'الخدمات',
    copy: 'Design, delivery and specialist consultancy scopes.',
    copyAr: 'نطاقات التصميم والتنفيذ والاستشارات المتخصصة.',
  },
  {
    href: 'projects',
    label: 'Projects',
    labelAr: 'المشاريع',
    copy: 'Selected work from the official portfolio.',
    copyAr: 'أعمال مختارة من الملف الرسمي.',
  },
  {
    href: 'contact',
    label: 'Contact',
    labelAr: 'تواصل',
    copy: 'Reach the Abu Dhabi office or start an enquiry.',
    copyAr: 'تواصل مع مكتب أبوظبي أو ابدأ استفساراً.',
  },
];

function NextArrow({ar}) {
  return <ArrowRight size={16} className={ar ? 'reverse-arrow' : ''} />;
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  return {
    title: locale === 'ar' ? 'تحميل الملف التعريفي لأساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS Company Profile Download',
    description: locale === 'ar' ? 'تحميل الملف التعريفي الرسمي لشركة أساس للاستشارات الهندسية وإدارة المشاريع.' : 'Download the official ASAS Company Profile.',
  };
}

export default async function Downloads({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';

  return (
    <div className="downloads-index">
      <section className="downloads-hero">
        <div className="downloads-hero-photo" aria-hidden="true">
          <Image
            src={roleImages.DOWNLOADS_HERO}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <Container>
          <span className="breadcrumb">{ar ? 'أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS'} / {ar ? 'التحميلات' : 'Downloads'}</span>
          <h1>{ar ? 'موارد أساس للاستشارات الهندسية وإدارة المشاريع الرسمية.' : 'Official ASAS resources.'}</h1>
          <p>
            {ar
              ? 'تعرّف على الشركة وقدراتها ومنهجيتها ومشاريعها المختارة عبر الملف التعريفي الرسمي.'
              : 'Explore the firm, capabilities, methodology and selected projects through the official company profile.'}
          </p>
          <div className="downloads-hero-meta">
            <span>PDF</span>
            <span>{PROFILE_SIZE}</span>
            <span>{ar ? company.cityAr : company.city} · {company.year}</span>
          </div>
        </Container>
      </section>

      <section className="downloads-body">
        <Container>
          <header className="downloads-body-head">
            <p className="atlas-kicker">{ar ? 'الملفات المتاحة' : 'Available resources'}</p>
            <h2>{ar ? 'الملف التعريفي الرسمي' : 'Official company profile'}</h2>
            <p>
              {ar
                ? 'المستند المعتمد للتعريف بأساس للاستشارات الهندسية وإدارة المشاريع — المصدر الرسمي للمعلومات عن الشركة والأعمال.'
                : 'The approved document for introducing ASAS — the official source for firm and portfolio information.'}
            </p>
          </header>

          <article className="downloads-featured">
            <div className="downloads-featured-visual" aria-hidden="true">
              {companyDocumentImage ? (
                <Image
                  src={companyDocumentImage}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 100vw, 40vw"
                  style={{objectFit: 'cover', objectPosition: 'center 40%'}}
                />
              ) : null}
              <div className="downloads-featured-badge">
                <FileText size={22} />
                <span>PDF</span>
              </div>
            </div>
            <div className="downloads-featured-copy">
              <span className="downloads-featured-label">
                {ar ? 'المورد الأساسي' : 'Primary resource'}
              </span>
              <h3>{ar ? 'الملف التعريفي لشركة أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS Company Profile'}</h3>
              <p>
                {ar
                  ? 'يتضمن نظرة على الشركة والتخصصات والمنهجية وأمثلة من المشاريع الرسمية لأساس للاستشارات الهندسية وإدارة المشاريع في أبوظبي.'
                  : 'Includes firm overview, disciplines, methodology and examples from the official ASAS portfolio in Abu Dhabi.'}
              </p>
              <ul className="downloads-featured-meta">
                <li>{ar ? 'صيغة' : 'Format'} · PDF</li>
                <li>{ar ? 'الحجم' : 'Size'} · {PROFILE_SIZE}</li>
                <li>{ar ? 'اللغة' : 'Language'} · {ar ? 'إنجليزي' : 'English'}</li>
              </ul>
              <ActionGroup className="downloads-featured-actions">
                <ActionButton variant="primary" href={PROFILE_HREF} icon="download" download>
                  {ar ? 'تحميل الملف التعريفي' : 'Download company profile'}
                </ActionButton>
                <ActionButton variant="outline" href={`/${locale}/company-profile`}>
                  {ar ? 'فتح في المتصفح' : 'Open in browser'}
                </ActionButton>
              </ActionGroup>
            </div>
          </article>

          <div className="downloads-contents">
            <h3>{ar ? 'ماذا يتضمن الملف؟' : 'What is inside?'}</h3>
            <div className="downloads-contents-grid">
              {profileContents.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="downloads-content-card" key={item.title}>
                    <span className="downloads-content-icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <h4>{ar ? item.titleAr : item.title}</h4>
                    <p>{ar ? item.copyAr : item.copy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="downloads-related">
        <Container>
          <header className="downloads-related-head">
            <p className="atlas-kicker">{ar ? 'استكشف الموقع' : 'Explore the site'}</p>
            <h2>{ar ? 'مصادر إضافية على الموقع' : 'More on the website'}</h2>
            <p>
              {ar
                ? 'بعد التحميل، راجع الصفحات التالية لتفاصيل أحدث عن الخدمات والمشاريع والتواصل.'
                : 'After downloading, use these pages for the latest detail on services, projects and contact.'}
            </p>
          </header>
          <div className="downloads-related-grid">
            {relatedLinks.map((item) => (
              <Link className="downloads-related-card" href={`/${locale}/${item.href}`} key={item.href}>
                <h3>{ar ? item.labelAr : item.label}</h3>
                <p>{ar ? item.copyAr : item.copy}</p>
                <span className="atlas-link">
                  {ar ? 'انتقال' : 'Go'}
                  <NextArrow ar={ar} />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="downloads-cta asas-cta-band">
        <div className="downloads-cta-veil" aria-hidden="true" />
        <Container className="downloads-cta-inner">
          <div className="downloads-cta-copy">
            <p className="downloads-cta-kicker">
              <i />
              {ar ? 'الخطوة التالية' : 'Next Step'}
            </p>
            <h2>{ar ? 'هل ترغب بمناقشة مشروع؟' : 'Ready to discuss a project?'}</h2>
            <p>
              {ar
                ? 'راجع المشاريع المختارة أو تواصل مع المكتب لبدء استفسار مشروع.'
                : 'Review selected work from the portfolio, or contact the office to start a project enquiry.'}
            </p>
            <ActionGroup className="downloads-cta-actions">
              <ActionButton variant="primary" href={`/${locale}/project-enquiry`}>
                {ar ? 'أرسل استفسار مشروع' : 'Submit a Project Enquiry'}
              </ActionButton>
              <ActionButton variant="ghost" href={`/${locale}/projects`}>
                {ar ? 'عرض المشاريع' : 'View projects'}
              </ActionButton>
              <ActionButton variant="ghost" href={`/${locale}/contact`}>
                {ar ? 'صفحة التواصل' : 'Contact page'}
              </ActionButton>
            </ActionGroup>
          </div>
          <ul className="downloads-cta-words" aria-hidden="true">
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
