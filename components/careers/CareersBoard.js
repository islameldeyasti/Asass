'use client';

import {useMemo, useState} from 'react';
import Link from 'next/link';
import {ArrowRight, Briefcase, MapPin} from 'lucide-react';
import {
  careerDepartments,
  employmentTypes,
  getDepartment,
  getOpenJobs,
} from '@/data/careers';

function NextArrow({ar}) {
  return <ArrowRight size={15} className={ar ? 'reverse-arrow' : ''} />;
}

export default function CareersBoard({locale}) {
  const ar = locale === 'ar';
  const [filter, setFilter] = useState('all');
  const openJobs = getOpenJobs();

  const filtered = useMemo(() => {
    if (filter === 'all') return openJobs;
    return openJobs.filter((job) => job.department === filter);
  }, [filter, openJobs]);

  const counts = useMemo(() => {
    const map = {all: openJobs.length};
    careerDepartments.forEach((dept) => {
      map[dept.id] = openJobs.filter((job) => job.department === dept.id).length;
    });
    return map;
  }, [openJobs]);

  return (
    <div className="careers-board">
      <div className="careers-board-head">
        <div>
          <p className="atlas-kicker">{ar ? 'الوظائف المفتوحة' : 'Open positions'}</p>
          <h2>{ar ? 'الشواغر الحالية' : 'Current openings'}</h2>
          <p>
            {ar
              ? 'تصفّح الأدوار حسب التخصص داخل المكتب وقدّم طلبك عبر النموذج.'
              : 'Browse roles by in-house discipline and apply through the on-site form.'}
          </p>
        </div>
        <Link className="atlas-link" href={`/${locale}/careers#apply`}>
          {ar ? 'طلب عام' : 'General application'}
          <NextArrow ar={ar} />
        </Link>
      </div>

      <nav className="careers-filters" aria-label={ar ? 'تصفية حسب التخصص' : 'Filter by department'}>
        <button
          type="button"
          className={filter === 'all' ? 'is-active' : undefined}
          onClick={() => setFilter('all')}
        >
          {ar ? 'الكل' : 'All'}
          <span>{counts.all}</span>
        </button>
        {careerDepartments.map((dept) => (
          <button
            key={dept.id}
            type="button"
            className={filter === dept.id ? 'is-active' : undefined}
            onClick={() => setFilter(dept.id)}
          >
            {ar ? dept.labelAr : dept.label}
            <span>{counts[dept.id]}</span>
          </button>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <div className="careers-empty">
          <Briefcase size={28} aria-hidden="true" />
          <h3>
            {ar
              ? 'لا توجد شواغر مفتوحة حالياً في هذا التخصص'
              : filter === 'all'
                ? 'No open positions right now'
                : 'No open positions in this discipline'}
          </h3>
          <p>
            {ar
              ? 'تحقّق لاحقاً، أو قدّم طلباً عاماً أدناه ليبقى ملفك ضمن اعتبارات التوظيف عند توفر احتياج مناسب.'
              : 'Check back soon, or submit a general application below so your CV can be considered when a suitable need arises.'}
          </p>
          <Link className="button" href={`/${locale}/careers#apply`}>
            {ar ? 'تقديم طلب عام' : 'Submit a general application'}
          </Link>
        </div>
      ) : (
        <div className="careers-grid">
          {filtered.map((job) => {
            const dept = getDepartment(job.department);
            const type = employmentTypes[job.type];
            return (
              <article className="careers-card" key={job.slug}>
                <div className="careers-card-meta">
                  <span>{ar ? dept?.labelAr : dept?.label}</span>
                  <span>{type ? (ar ? type.ar : type.en) : job.type}</span>
                </div>
                <h3>{ar ? job.titleAr : job.title}</h3>
                <p>{ar ? job.summaryAr : job.summary}</p>
                <div className="careers-card-foot">
                  <span>
                    <MapPin size={14} aria-hidden="true" />
                    {ar ? job.locationAr : job.location}
                  </span>
                  <Link className="atlas-link" href={`/${locale}/careers/${job.slug}`}>
                    {ar ? 'عرض الدور' : 'View role'}
                    <NextArrow ar={ar} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
