import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Building2,
  Calculator,
  CircuitBoard,
  ClipboardList,
  HardHat,
  Ruler,
} from 'lucide-react';
import {Container} from '@/components/UI';
import {ActionButton, ActionGroup} from '@/components/ActionButton';
import CareersBoard from '@/components/careers/CareersBoard';
import ApplicationForm from '@/components/careers/ApplicationForm';
import {careerDepartments, getOpenJobs} from '@/data/careers';
import {company} from '@/data/company';
import {ctaBandImages, roleImages} from '@/data/image-manifest';

const departmentIcons = {
  architecture: Building2,
  structural: Ruler,
  mep: CircuitBoard,
  'quantity-surveying': Calculator,
  'construction-management': HardHat,
  'admin-support': ClipboardList,
};

function NextArrow({ar}) {
  return <ArrowRight size={16} className={ar ? 'reverse-arrow' : ''} />;
}

export async function generateMetadata({params}) {
  const {locale} = await params;
  const open = getOpenJobs().length;
  return {
    title: locale === 'ar' ? 'العمل لدى أساس للاستشارات الهندسية وإدارة المشاريع' : 'Careers at ASAS',
    description:
      locale === 'ar'
        ? `شواغر مفتوحة: ${open}. تخصصات هندسية تعمل ضمن فريق واحد في أبوظبي.`
        : `${open} open roles. Engineering disciplines working as one team in Abu Dhabi.`,
  };
}

export default async function Careers({params}) {
  const {locale} = await params;
  const ar = locale === 'ar';
  const openJobs = getOpenJobs();
  const openCount = openJobs.length;
  const ctaImage = ctaBandImages.careers;

  const deptCounts = Object.fromEntries(
    careerDepartments.map((dept) => [
      dept.id,
      openJobs.filter((job) => job.department === dept.id).length,
    ]),
  );

  return (
    <div className="careers-page">
      <section className="careers-hero">
        <div className="careers-hero-photo" aria-hidden="true">
          <Image
            src={roleImages.CAREERS_HERO}
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <Container>
          <span className="breadcrumb">{ar ? 'أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS'} / {ar ? 'الوظائف' : 'Careers'}</span>
          <h1>
            {ar ? 'تخصصات هندسية تعمل ضمن فريق واحد.' : 'Engineering disciplines working as one team.'}
          </h1>
          <p>
            {ar
              ? 'تحدد احتياجات التوظيف وفق كل مشروع، مع دعم فرق أساس للاستشارات الهندسية وإدارة المشاريع بخبرات خارجية عند الحاجة للأعمال واسعة النطاق.'
              : 'Staffing is set according to each project, with external associates supplementing ASAS teams for large-scale work when required.'}
          </p>
          <div className="careers-hero-meta">
            <span>
              {openCount} {ar ? 'شواغر مفتوحة' : openCount === 1 ? 'open role' : 'open roles'}
            </span>
            <span>{ar ? company.cityAr : company.city} · {company.year}</span>
            <a href="#openings">{ar ? 'عرض الشواغر' : 'Browse openings'}</a>
          </div>
        </Container>
      </section>

      <section className="careers-disciplines">
        <Container>
          <header className="careers-section-head">
            <p className="atlas-kicker">{ar ? 'الفريق' : 'The practice'}</p>
            <h2>{ar ? 'التخصصات داخل المكتب' : 'In-house disciplines'}</h2>
            <p>
              {ar
                ? 'فرق أساس للاستشارات الهندسية وإدارة المشاريع تعمل عبر تخصصات منسّقة — من التصميم إلى الإشراف ودعم المشاريع.'
                : 'ASAS teams work across coordinated disciplines — from design through supervision and project support.'}
            </p>
          </header>
          <div className="careers-discipline-grid">
            {careerDepartments.map((dept) => {
              const Icon = departmentIcons[dept.id] || Building2;
              const count = deptCounts[dept.id] || 0;
              return (
                <a
                  className="careers-discipline-card"
                  href={`#openings`}
                  key={dept.id}
                >
                  <span className="careers-discipline-icon" aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <div>
                    <h3>{ar ? dept.labelAr : dept.label}</h3>
                    <p>
                      {count > 0
                        ? `${count} ${ar ? 'شاغر مفتوح' : count === 1 ? 'open role' : 'open roles'}`
                        : ar
                          ? 'لا شواغر حالياً — يمكن التقديم العام'
                          : 'No openings now — general applications welcome'}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="careers-openings" id="openings">
        <Container>
          <CareersBoard locale={locale} />
        </Container>
      </section>

      <section className="careers-apply-section" id="apply">
        <Container className="careers-apply-layout">
          <div className="careers-apply-intro">
            <p className="atlas-kicker">{ar ? 'التقديم' : 'Apply'}</p>
            <h2>{ar ? 'قدّم طلبك عبر الموقع' : 'Apply on this site'}</h2>
            <p>
              {ar
                ? 'ارفع سيرتك الذاتية وقدّم لوظيفة محددة أو عبر طلب عام. لا حاجة لإرسال بريد يدوي مع المرفق.'
                : 'Upload your CV and apply for a listed role or as a general application. No need to email your CV separately.'}
            </p>
            <ul className="careers-apply-points">
              <li>{ar ? 'تقديم لوظيفة مدرجة أو طلب عام' : 'Apply to a listed role or generally'}</li>
              <li>{ar ? 'رفع PDF أو DOC بحد أقصى 5 ميجابايت' : 'Upload PDF or DOC up to 5 MB'}</li>
              <li>{ar ? 'تأكيد فوري بعد الإرسال' : 'Instant confirmation after submit'}</li>
            </ul>
            <ActionButton variant="outline" href={`/${locale}/careers#openings`}>
              {ar ? 'العودة إلى الشواغر' : 'Back to openings'}
            </ActionButton>
          </div>
          <div className="careers-apply-panel">
            <ApplicationForm locale={locale} defaultPosition="general" />
          </div>
        </Container>
      </section>

      <section className="careers-cta asas-cta-band">
        <div className="careers-cta-media" aria-hidden="true">
          {ctaImage ? (
            <Image src={ctaImage} alt="" fill sizes="100vw" style={{objectFit: 'cover', objectPosition: '50% 30%'}} />
          ) : null}
        </div>
        <div className="careers-cta-veil" aria-hidden="true" />
        <Container className="careers-cta-inner">
          <div className="careers-cta-copy">
            <p className="careers-cta-kicker">
              <i />
              {ar ? 'تواصل' : 'Contact'}
            </p>
            <h2>{ar ? 'أسئلة حول التوظيف؟' : 'Questions about hiring?'}</h2>
            <p>
              {ar
                ? 'للاستفسارات المهنية يمكن التواصل مع مكتب أبوظبي عبر البريد الرسمي.'
                : 'For career questions, reach the Abu Dhabi office through the official email.'}
            </p>
            <ActionGroup className="careers-cta-actions">
              <ActionButton
                variant="primary"
                href={`mailto:${company.email}?subject=${encodeURIComponent('Career enquiry')}`}
                icon={false}
              >
                {company.email}
              </ActionButton>
              <ActionButton variant="ghost" href={`/${locale}/contact`}>
                {ar ? 'صفحة التواصل' : 'Contact page'}
              </ActionButton>
            </ActionGroup>
          </div>
          <ul className="careers-cta-words" aria-hidden="true">
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
