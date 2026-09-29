import '../fonts-arabic.css';
import './admin.css';
import './admin-system.css';
import './admin-ar.css';
import './admin-inputs.css';
import '../corporate-print.css';
import {ToastProvider} from '@/components/admin/ui/ToastProvider';
import AdminLangRoot from '@/components/admin/ui/AdminLangRoot';
import {readAdminLangCookie, readAdminThemeCookie} from '@/lib/admin/locale';
import {setAdminLangRuntime} from '@/lib/admin/translate';

export const metadata = {
  title: 'ASAS | Admin',
  robots: {index: false, follow: false},
};

export default async function AdminLayout({children}) {
  const lang = await readAdminLangCookie();
  const theme = await readAdminThemeCookie();
  setAdminLangRuntime(lang);

  return (
    <AdminLangRoot initialLang={lang} initialTheme={theme}>
      <ToastProvider>
        <div className="adm-body cms-body">{children}</div>
      </ToastProvider>
    </AdminLangRoot>
  );
}
