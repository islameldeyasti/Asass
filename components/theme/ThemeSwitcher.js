'use client';

import {Monitor, Moon, Sun} from 'lucide-react';
import {useTheme} from './ThemeProvider';

const OPTIONS = [
  {id: 'light', Icon: Sun, labelEn: 'Light', labelAr: 'فاتح'},
  {id: 'dark', Icon: Moon, labelEn: 'Dark', labelAr: 'داكن'},
  {id: 'system', Icon: Monitor, labelEn: 'System', labelAr: 'النظام'},
];

/**
 * Compact theme control.
 * - variant="icon": cycles Light → Dark → System (desktop topbar / header)
 * - variant="menu": full Light / Dark / System row (mobile nav)
 */
export default function ThemeSwitcher({locale = 'en', variant = 'icon'}) {
  const ar = locale === 'ar';
  const {preference, setPreference, cyclePreference} = useTheme();
  const active = OPTIONS.find((o) => o.id === preference) || OPTIONS[2];
  const ActiveIcon = active.Icon;

  if (variant === 'menu') {
    return (
      <div className="asas-theme-menu" role="group" aria-label={ar ? 'المظهر' : 'Appearance'}>
        <p className="asas-theme-menu-label">{ar ? 'المظهر' : 'Appearance'}</p>
        <div className="asas-theme-menu-row">
          {OPTIONS.map(({id, Icon, labelEn, labelAr}) => (
            <button
              key={id}
              type="button"
              className={`asas-theme-chip${preference === id ? ' is-active' : ''}`}
              aria-pressed={preference === id}
              onClick={() => setPreference(id)}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{ar ? labelAr : labelEn}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const nextHint =
    preference === 'dark'
      ? ar
        ? 'التبديل إلى الوضع الفاتح'
        : 'Switch to light'
      : preference === 'light'
        ? ar
          ? 'التبديل إلى وضع النظام'
          : 'Switch to system'
        : ar
          ? 'التبديل إلى الوضع الداكن'
          : 'Switch to dark';

  return (
    <button
      type="button"
      className="asas-theme-toggle"
      aria-label={nextHint}
      title={`${ar ? 'المظهر' : 'Theme'}: ${ar ? active.labelAr : active.labelEn}`}
      onClick={cyclePreference}
    >
      <ActiveIcon size={15} aria-hidden="true" />
      <span className="asas-theme-toggle-sr">
        {ar ? active.labelAr : active.labelEn}
      </span>
    </button>
  );
}
