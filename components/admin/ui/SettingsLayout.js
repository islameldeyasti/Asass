'use client';

import Link from 'next/link';
import {useState} from 'react';
import {adminText} from '@/lib/admin/translate';

export const CMS_SETTINGS_NAV = [
  {id: 'general', href: '/admin/settings', label: 'General'},
  {id: 'branding', href: '/admin/settings/branding', label: 'Branding'},
  {id: 'contact', href: '/admin/settings/contact', label: 'Contact'},
  {id: 'social', href: '/admin/settings/social', label: 'Social'},
  {id: 'delivery', href: '/admin/settings/delivery', label: 'Delivery'},
];

export default function SettingsLayout({items = [], active, children}) {
  const [current, setCurrent] = useState(active);

  return (
    <div className="kt-settings">
      <aside className="kt-settings-nav" aria-label={adminText('Settings')}>
        {items.map((item) => {
          const className = `kt-settings-link${current === item.id ? ' is-active' : ''}`;
          if (item.href) {
            return (
              <Link key={item.id} href={item.href} className={className}>
                {adminText(item.label)}
              </Link>
            );
          }
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={className}
              onClick={() => setCurrent(item.id)}
            >
              {adminText(item.label)}
            </a>
          );
        })}
      </aside>
      <div className="kt-settings-main">{children}</div>
    </div>
  );
}
