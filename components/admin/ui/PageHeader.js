'use client';

import {adminText} from '@/lib/admin/translate';
import {useAdminLang} from '@/components/admin/ui/AdminLangRoot';

export default function PageHeader({title, subtitle, actions, breadcrumb}) {
  useAdminLang();
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
