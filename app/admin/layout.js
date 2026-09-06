import './admin.css';

export const metadata = {
  title: 'ASAS Admin',
  robots: {index: false, follow: false},
};

export default function AdminLayout({children}) {
  return <div className="adm-body">{children}</div>;
}
