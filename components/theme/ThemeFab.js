'use client';

import {Moon, Sun} from 'lucide-react';
import {useTheme} from './ThemeProvider';

/** Fixed right-side FAB — toggles Light ↔ Dark only. */
export default function ThemeFab({locale = 'en'}) {
  const ar = locale === 'ar';
  const {resolved, toggleLightDark} = useTheme();
  const isDark = resolved === 'dark';

  return (
    <button
      type="button"
      className="asas-theme-fab"
      aria-label={
        isDark
          ? ar
            ? 'التبديل إلى الوضع الفاتح'
            : 'Switch to light mode'
          : ar
            ? 'التبديل إلى الوضع الداكن'
            : 'Switch to dark mode'
      }
      title={isDark ? (ar ? 'فاتح' : 'Light') : ar ? 'داكن' : 'Dark'}
      onClick={toggleLightDark}
    >
      {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  );
}
