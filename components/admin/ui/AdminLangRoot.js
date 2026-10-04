'use client';

import {createContext, useContext, useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import {
  normalizeAdminLang,
  normalizeAdminTheme,
  writeAdminLangCookie,
  writeAdminThemeCookie,
} from '@/lib/admin/locale';
import {setAdminLangRuntime} from '@/lib/admin/translate';

const AdminLangContext = createContext({
  lang: 'en',
  setLang: () => {},
  theme: 'light',
  setTheme: () => {},
});

export function useAdminLang() {
  return useContext(AdminLangContext);
}

export function useAdminTheme() {
  const ctx = useContext(AdminLangContext);
  return {theme: ctx.theme, setTheme: ctx.setTheme};
}

export default function AdminLangRoot({initialLang = 'en', initialTheme = 'light', children}) {
  const router = useRouter();
  const [lang, setLangState] = useState(() => {
    const next = normalizeAdminLang(initialLang);
    setAdminLangRuntime(next);
    return next;
  });
  const [theme, setThemeState] = useState(() => normalizeAdminTheme(initialTheme));

  const value = useMemo(
    () => ({
      lang,
      theme,
      setLang(next) {
        const normalized = writeAdminLangCookie(next);
        setAdminLangRuntime(normalized);
        setLangState(normalized);
        router.refresh();
      },
      setTheme(next) {
        setThemeState(writeAdminThemeCookie(next));
      },
    }),
    [lang, theme, router],
  );

  return (
    <AdminLangContext.Provider value={value}>
      <div
        lang={lang}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        data-theme={theme}
        className={lang === 'ar' ? 'admin-ar' : 'admin-en'}
      >
        {children}
      </div>
    </AdminLangContext.Provider>
  );
}
