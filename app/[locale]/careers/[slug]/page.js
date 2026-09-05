import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft, MapPin} from 'lucide-react';
import {Container} from '@/components/UI';
import ApplicationForm from '@/components/careers/ApplicationForm';
import {
  employmentTypes,
  getDepartment,
  getJobBySlug,
  getOpenJobs,
  jobs,
} from '@/data/careers';

export function generateStaticParams() {
  return ['en', 'ar'].flatMap((locale) =>
    jobs
      .filter((job) => job.status === 'open')
      .map((job) => ({locale, slug: job.slug})),
  );
}

export async function generateMetadata({params}) {
  const {locale, slug} = await params;
  const job = getJobBySlug(slug);
  if (!job || job.status !== 'open') {
    return {title: locale === 'ar' ? 'وظيفة غير متاحة' : 'Role unavailable'};
  }
  return {
    title: locale === 'ar' ? `${job.titleAr} | وظائف أساس` : `${job.title} | ASAS Careers`,
    description: locale === 'ar' ? job.summaryAr : job.summary,
  };
}

export default async function CareerDetail({params}) {
  const {locale, slug} = await params;
  const ar = locale === 'ar';
  const job = getJobBySlug(slug);

  if (!job || job.status !== 'open') notFound();

  const dept = getDepartment(job.department);
  const type = employmentTypes[job.type];
  const openCount = getOpenJobs().length;

  return (
    <div className="careers-page">
      <section className="careers-detail-hero">
        <Container>
          <span className="breadcrumb">
            ASAS / {ar ? 'الوظائف' : 'Careers'} / {ar ? job.titleAr : job.title}
          </span>
          <h1>{ar ? job.titleAr : job.title}</h1>
          <p>{ar ? job.summaryAr : job.summary}</p>
        </Container>
      </section>

      <section className="careers-detail">
        <Container className="careers-detail-layout">
          <div className="careers-detail-copy">
            <Link className="careers-back" href={`/${locale}/careers#openings`}>
              <ArrowLeft size={16} aria-hidden="true" />
              {ar ? 'العودة إلى الشواغر' : 'Back to openings'}
            </Link>

            <div className="careers-detail-meta">
              <span>{ar ? dept?.labelAr : dept?.label}</span>
              <span>{type ? (ar ? type.ar : type.en) : job.type}</span>
              <span>
                <MapPin size={12} aria-hidden="true" style={{marginInlineEnd: 4, verticalAlign: '-1px'}} />
                {ar ? job.locationAr : job.location}
              </span>
            </div>

            <p>{ar ? job.descriptionAr : job.description}</p>

            <h2>{ar ? 'المسؤوليات' : 'Responsibilities'}</h2>
            <ul>
              {(ar ? job.responsibilitiesAr : job.responsibilities).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h2>{ar ? 'المتطلبات' : 'Requirements'}</h2>
            <ul>
              {(ar ? job.requirementsAr : job.requirements).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p className="careers-detail-note">
              {ar
                ? `${openCount} شواغر مفتوحة حالياً عبر تخصصات المكتب.`
                : `${openCount} open roles currently listed across ASAS disciplines.`}
            </p>
          </div>

          <aside className="careers-detail-aside" id="apply">
            <h2>{ar ? 'قدّم الآن' : 'Apply now'}</h2>
            <p>
              {ar
                ? 'أرفق سيرتك الذاتية وقدّم مباشرة لهذه الوظيفة.'
                : 'Attach your CV and apply directly for this role.'}
            </p>
            <ApplicationForm
              locale={locale}
              defaultPosition={job.slug}
              lockedPosition
            />
          </aside>
        </Container>
      </section>
    </div>
  );
}
