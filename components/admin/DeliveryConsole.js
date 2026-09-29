'use client';

import {useState} from 'react';
import {adminText} from '@/lib/admin/translate';

export default function DeliveryConsole() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');

  async function run(action) {
    setBusy(action);
    setMessage('');
    try {
      if (action === 'backup') {
        const res = await fetch('/api/admin/delivery?action=backup');
        if (!res.ok) throw new Error((await res.json()).error || 'Backup failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'asas-backup.zip';
        link.click();
        setMessage('Backup downloaded.');
        return;
      }
      const res = await fetch('/api/admin/delivery', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setMessage(JSON.stringify(data.result || data, null, 2));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="adm-stack">
      <p className="adm-section-help">
        {adminText(
          'Delivery controls: full data backup, identity sync across website/ops/users, and a mail-queue test. Live email needs RESEND_API_KEY.',
        )}
      </p>
      <div className="table-data-bar">
        <button type="button" className="erp-btn" disabled={Boolean(busy)} onClick={() => run('backup')}>
          {adminText(busy === 'backup' ? 'Preparing…' : 'Download backup')}
        </button>
        <button type="button" className="erp-btn secondary" disabled={Boolean(busy)} onClick={() => run('sync')}>
          {adminText(busy === 'sync' ? 'Syncing…' : 'Sync identities')}
        </button>
        <button type="button" className="erp-btn secondary" disabled={Boolean(busy)} onClick={() => run('mail-test')}>
          {adminText(busy === 'mail-test' ? 'Sending…' : 'Test mail queue')}
        </button>
      </div>
      {message ? <pre className="adm-card" style={{padding: 16, overflow: 'auto'}}>{message}</pre> : null}
    </div>
  );
}
