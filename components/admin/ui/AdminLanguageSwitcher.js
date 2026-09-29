'use client';

import {useAdminLang} from '@/components/admin/ui/AdminLangRoot';

export default function AdminLanguageSwitcher({className = ''}) {
  const {lang, setLang} = useAdminLang();

  return (
    <nav className={`adm-lang-switch ${className}`.trim()} aria-label="Language" suppressHydrationWarning>
      <button
        type="button"
        className={lang === 'en' ? 'is-active' : ''}
        aria-pressed={lang === 'en'}
        aria-label="Switch to English"
        onClick={() => setLang('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={lang === 'ar' ? 'is-active' : ''}
        aria-pressed={lang === 'ar'}
        aria-label="Switch to Arabic"
        onClick={() => setLang('ar')}
      >
        ع
      </button>
    </nav>
  );
}
