/**
 * Typography / metadata card used when a named project has no approved original photo.
 * Never substitutes another project's architecture or generic stock.
 */
export default function ProjectVisualFallback({project, locale = 'en', className = ''}) {
  const ar = locale === 'ar';
  const title = ar ? project.titleAr || project.title : project.title;
  const location =
    (ar ? project.locationShortAr || project.locationAr : project.locationShort || project.location) ||
    (ar ? 'أبوظبي' : 'Abu Dhabi');
  const category = project.category || '';

  return (
    <div className={`asas-project-fallback ${className}`.trim()} role="img" aria-label={title}>
      <span className="asas-project-fallback-kicker">{ar ? 'مشروع أساس للاستشارات الهندسية وإدارة المشاريع' : 'ASAS Project'}</span>
      <strong className="asas-project-fallback-title">{title}</strong>
      <span className="asas-project-fallback-meta">
        {location}
        {category ? ` · ${category}` : ''}
      </span>
      <span className="asas-project-fallback-note">
        {ar ? 'بانتظار الصورة الأصلية للمشروع' : 'Awaiting original project photography'}
      </span>
    </div>
  );
}
