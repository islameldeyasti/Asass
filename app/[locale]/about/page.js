import Image from 'next/image';
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Handshake,
  ShieldCheck,
} from 'lucide-react';
import {Container} from '@/components/UI';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import {
  company,
  mission,
  standards,
  stats,
  strengths,
  vision,
  workLocations,
} from '@/data/company';
import {ctaBandImages, roleImages} from '@/data/image-manifest';

const strengthIcons = [CheckCircle2, Clock3, Handshake];

export async function generateMetadata({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  return {
    title: ar ? 'عن أساس للاستشارات الهندسية وإدارة المشاريع | استشارات هندسية في أبوظبي' : 'About ASAS | Abu Dhabi Engineering Consultancy',
    description: ar ? company.descriptionAr : company.description,
  };
}

export default async function About({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  const ctaImage = ctaBandImages.about;

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-photo" aria-hidden="true">
          <Image
            src={roleImages.ABOUT_HERO}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <Container>
          <span className="breadcrumb">{ar ? 'أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS'} / {ar ? 'عن أساس للاستشارات الهندسية وإدارة المشاريع' : 'About'}</span>
          <h1>
            {ar
              ? 'خبرة هندسية تأسست في أبوظبي عام 2009.'
              : 'Engineering expertise founded in Abu Dhabi in 2009.'}
          </h1>
          <p>{ar ? company.descriptionAr : company.description}</p>
          <div className="about-hero-meta">
            <span>
              {ar ? company.cityAr : company.city} · {company.year}
            </span>
            <span>{ar ? company.parentGroupAr : company.parentGroup}</span>
            <ActionButton variant="ghost" href={`/${locale}/downloads`} icon="file">
              {ar ? 'الملف التعريفي' : 'Company profile'}
            </ActionButton>
          </div>
        </Container>
      </section>

      <section className="about-body">
        <Container>
          <article className="about-featured">
            <div className="about-featured-media">
              <Image
                src={roleImages.ABOUT_FEATURED}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
              />
            </div>
            <div className="about-featured-copy">
              <p className="atlas-kicker">{ar ? 'الشركة' : 'The firm'}</p>
              <h2>{ar ? 'مكتب واحد، وتخصصات مترابطة.' : 'One consultancy, connected disciplines.'}</h2>
              <p>
                {ar
                  ? 'تأسست أساس للاستشارات الهندسية وإدارة المشاريع عام 2009 في إمارة أبوظبي كمكتب متخصص في الخدمات الهندسية. يشمل عملها المباني والأبراج السكنية والتجارية والفلل والقصور والمجمعات والمشاريع المرتبطة بها.'
                  : 'ASAS Engineering & Project Management Consultancy was founded in 2009 in the Emirate of Abu Dhabi as an office specialising in engineering services. Its work includes buildings, residential and commercial towers, villas, palaces, commercial complexes and related projects.'}
              </p>
              <p>
                {ar
                  ? 'تغطي خدمات المكتب التصميم المعماري والإنشائي والمدني والكهربائي والميكانيكي، إلى جانب دراسات التكاليف والكميات وإدارة المشاريع والإشراف على التنفيذ.'
                  : 'The practice covers architectural, structural, civil, electrical and mechanical design, together with cost and quantity studies, project management and construction supervision.'}
              </p>
              <ActionButton variant="outline" href={`/${locale}/services`}>
                {ar ? 'عرض الخدمات' : 'View services'}
              </ActionButton>
            </div>
          </article>

          <div className="about-stats">
            {stats.map((stat) => (
              <div className="about-stat" key={stat.label}>
                <strong className="ltr-isolate" dir="ltr">{stat.value}</strong>
                <span>{ar ? stat.labelAr : stat.label}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="about-vision">
        <Container className="about-vision-grid">
          <article className="about-vision-card">
            <p className="atlas-kicker">{ar ? 'الرؤية' : 'Vision'}</p>
            <h2>{ar ? 'قيمة هندسية تتطور باستمرار.' : 'Advancing the value of engineering service.'}</h2>
            <p>{ar ? vision.ar : vision.en}</p>
          </article>
          <article className="about-vision-card">
            <p className="atlas-kicker">{ar ? 'الرسالة' : 'Mission'}</p>
            <h2>{ar ? 'خدمة تستجيب لاحتياجات العملاء.' : 'Service responsive to changing needs.'}</h2>
            <p>{ar ? mission.ar : mission.en}</p>
          </article>
        </Container>
      </section>

      <section className="about-strengths">
        <Container>
          <header className="about-section-head">
            <p className="atlas-kicker">{ar ? 'نقاط القوة' : 'Strengths'}</p>
            <h2>{ar ? 'التزامات تدعم كل مشروع.' : 'Commitments behind every project.'}</h2>
          </header>
          <div className="about-strength-grid">
            {strengths.map((item, index) => {
              const Icon = strengthIcons[index] || CheckCircle2;
              return (
                <article className="about-strength-card" key={item.title}>
                  <Icon size={22} aria-hidden="true" />
                  <h3>{ar ? item.titleAr : item.title}</h3>
                  <p>{ar ? item.copyAr : item.copy}</p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="about-locations">
        <Container className="about-split">
          <header className="about-section-head">
            <p className="atlas-kicker">{ar ? 'نطاق العمل' : 'Where we work'}</p>
            <h2>
              {ar
                ? 'من أبوظبي إلى مواقع مختارة في الإمارات.'
                : 'From Abu Dhabi to project locations across the UAE.'}
            </h2>
          </header>
          <ul className="about-chip-list">
            {workLocations.map((location) => (
              <li key={location.en}>{ar ? location.ar : location.en}</li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="about-standards">
        <Container className="about-split">
          <header className="about-section-head">
            <p className="atlas-kicker">{ar ? 'المعايير' : 'Standards'}</p>
            <h2>{ar ? 'متطلبات التصميم والمراجعة.' : 'Design and review requirements.'}</h2>
          </header>
          <ul className="about-standard-list">
            {standards.map((standard) => (
              <li key={standard.name}>
                <ShieldCheck size={18} aria-hidden="true" />
                <div>
                  <strong>{ar ? standard.nameAr : standard.name}</strong>
                  <span>{ar ? standard.useAr : standard.use}</span>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="about-mir">
        <Container className="about-mir-inner">
          <div className="about-mir-copy">
            <p className="atlas-kicker">{ar ? 'مجموعة مير' : 'Mir Group'}</p>
            <h2>{ar ? company.parentGroupAr : company.parentGroup}</h2>
            <p>
              {ar
                ? 'تعكس مجموعة مير في أنشطتها قيم السلام والازدهار والممارسة الأخلاقية للأعمال. تعمل المجموعة في مجالات تشمل العقارات وإدارة المشاريع والاستشارات والسياحة والضيافة والتجارة الدولية والبنية التحتية وحلول الطاقة والتعليم.'
                : 'Mir Group’s philosophy reflects peace, prosperity and ethical business practice. The group’s activities include real estate, project management and consultancy, tourism, hospitality, international trade, infrastructure, energy solutions and education.'}
            </p>
          </div>
          <div className="about-mir-card">
            <ClipboardCheck size={22} aria-hidden="true" />
            <div>
              <strong>{ar ? 'الملف التعريفي الرسمي' : 'Official company profile'}</strong>
              <p>
                {ar
                  ? 'حمّل الملف للاطلاع على القدرات والمنهجية والأعمال المختارة.'
                  : 'Download the profile for capabilities, methodology and selected work.'}
              </p>
              <ActionButton variant="outline" href={`/${locale}/downloads`} icon="file">
                {ar ? 'صفحة التحميلات' : 'Downloads page'}
              </ActionButton>
            </div>
          </div>
        </Container>
      </section>

      <section className="about-cta asas-cta-band">
        <div className="about-cta-media" aria-hidden="true">
          {ctaImage ? (
            <Image src={ctaImage} alt="" fill sizes="100vw" style={{objectFit: 'cover', objectPosition: '50% 40%'}} />
          ) : null}
        </div>
        <div className="about-cta-veil" aria-hidden="true" />
        <Container className="about-cta-inner">
          <div className="about-cta-copy">
            <p className="about-cta-kicker">
              <i />
              {ar ? 'التالي' : 'Next'}
            </p>
            <h2>{ar ? 'استكشف الخدمات أو المشاريع' : 'Explore services or projects'}</h2>
            <p>
              {ar
                ? 'اطّلع على نطاقات الخدمات أو الأعمال المختارة من الملف الرسمي.'
                : 'Review service scopes or selected work from the official portfolio.'}
            </p>
            <ActionGroup className="about-cta-actions">
              <ActionButton variant="primary" href={`/${locale}/services`}>
                {ar ? 'الخدمات' : 'Services'}
              </ActionButton>
              <ActionButton variant="ghost" href={`/${locale}/projects`}>
                {ar ? 'المشاريع' : 'Projects'}
              </ActionButton>
            </ActionGroup>
          </div>
          <ul className="about-cta-words" aria-hidden="true">
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
