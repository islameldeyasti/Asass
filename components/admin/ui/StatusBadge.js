export default function StatusBadge({status = 'draft', children}) {
  const value = String(status || 'draft').toLowerCase();
  const label = children || value.replace(/_/g, ' ');

  return (
    <span className={`cms-badge ${value}`}>
      <span className="cms-badge-dot" aria-hidden />
      {label}
    </span>
  );
}
