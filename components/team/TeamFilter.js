'use client';

export default function TeamFilter({filters, active, onChange, locale}) {
  const ar = locale === 'ar';
  if (!filters?.length || filters.length <= 1) return null;

  return (
    <div className="tm-filters" role="tablist" aria-label={ar ? 'تصفية الفريق' : 'Filter team'}>
      {filters.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={active === item.id}
          className={active === item.id ? 'is-active' : ''}
          onClick={() => onChange(item.id)}
        >
          {ar ? item.labelAr : item.label}
        </button>
      ))}
    </div>
  );
}
