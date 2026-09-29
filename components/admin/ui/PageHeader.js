import {adminText} from '@/lib/admin/translate';

export default function PageHeader({title, subtitle, actions, breadcrumb}) {
  return (
    <header className="cms-page-header">
      <div className="cms-page-header-copy">
        {breadcrumb ? <div>{breadcrumb}</div> : null}
        {title ? <h1>{typeof title === 'string' ? adminText(title) : title}</h1> : null}
        {subtitle ? <p>{typeof subtitle === 'string' ? adminText(subtitle) : subtitle}</p> : null}
      </div>
      {actions ? <div className="cms-page-header-actions">{actions}</div> : null}
    </header>
  );
}
