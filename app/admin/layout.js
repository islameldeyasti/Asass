import '../fonts-arabic.css';
import './admin.css';
import '../corporate-print.css';
import {ToastProvider} from '@/components/admin/ui/ToastProvider';

export const metadata = {
  title: 'ASAS Admin',
  robots: {index: false, follow: false},
};

export default function AdminLayout({children}) {
  return (
    <ToastProvider>
      <div className="adm-body cms-body">{children}</div>
    </ToastProvider>
  );
}
