'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {switchLocalePath} from '@/lib/i18n/locale';
import {t} from '@/lib/i18n/ui';

/** EN ↔ AR switcher — preserves current path. */
export default function LanguageSwitcher({locale}) {
  const pathname = usePathname() || `/${locale}`;
  const enHref = switchLocalePath(pathname, 'en');
  const arHref = switchLocalePath(pathname, 'ar');

  return (
    <nav className="asas-lang-switch" aria-label={locale === 'ar' ? 'اللغة' : 'Language'}>
      <Link
        href={enHref}
        className={locale === 'en' ? 'is-active' : undefined}
        hrefLang="en"
        aria-label={t('switchToEnglish', locale)}
        aria-current={locale === 'en' ? 'true' : undefined}
      >
        EN
      </Link>
      <Link
        href={arHref}
        className={locale === 'ar' ? 'is-active' : undefined}
        hrefLang="ar"
        aria-label={t('switchToArabic', locale)}
        aria-current={locale === 'ar' ? 'true' : undefined}
      >
        ع
      </Link>
    </nav>
  );
}
