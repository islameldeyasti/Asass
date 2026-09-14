export default function EmptyState({
  icon: Icon,
  title = 'Nothing here yet',
  description,
  actions,
}) {
  return (
    <div className="cms-empty">
      {Icon ? (
        <div className="cms-empty-icon" aria-hidden>
          <Icon size={22} strokeWidth={1.75} />
        </div>
      ) : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {actions ? <div className="cms-empty-actions">{actions}</div> : null}
    </div>
  );
}
