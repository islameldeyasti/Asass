'use client';

import {useRouter} from 'next/navigation';

export default function AdminSignOut() {
  const router = useRouter();

  async function onClick() {
    await fetch('/api/admin/auth', {method: 'DELETE'});
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <button type="button" className="adm-btn-ghost" onClick={onClick}>
      Sign out
    </button>
  );
}
