export default function PageHeader({title, subtitle, actions, breadcrumb}) {
  return (
    <header className="cms-page-header">
      <div>
        {breadcrumb || null}
        {title ? <h1>{title}</h1> : null}
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="cms-page-header-actions">{actions}</div> : null}
    </header>
  );
}
