'use client';
import {adminText} from '@/lib/admin/translate';


import {useEffect, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {formatAdminDateTime} from '@/lib/admin/locale';

export default function NotificationsCenter({initialItems = [], initialUnread = 0}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [unread, setUnread] = useState(initialUnread);
  const [error, setError] = useState('');

  useEffect(() => {
    setItems(initialItems);
    setUnread(initialUnread);
  }, [initialItems, initialUnread]);

  async function refresh() {
    const res = await fetch('/api/admin/ops?resource=notifications');
    const body = await res.json();
    if (res.ok) {
      setItems(body.items || []);
      setUnread(body.unread || 0);
    }
    router.refresh();
  }

  async function markRead(id) {
    setError('');
    const res = await fetch('/api/admin/ops', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({resource: 'notification-read', document: {id}}),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    await refresh();
  }

  async function markAll() {
    setError('');
    const res = await fetch('/api/admin/ops', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({resource: 'notifications-read-all', document: {}}),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    await refresh();
  }

  return (
    <div className="adm-stack">
      <div style={{display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'}}>
        <p className="adm-section-help" style={{margin: 0}}>
          {adminText(unread)}{adminText(" unread")}</p>
        <button type="button" className="adm-btn-ghost" onClick={markAll} disabled={!unread}>{adminText("Mark all read")}</button>
      </div>
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      {items.map((n) => (
        <section
          key={n.id}
          className="adm-card"
          style={{opacity: n.readAt ? 0.72 : 1}}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'}}>
            <div>
              <h2 className="adm-section-title" style={{marginTop: 0, marginBottom: 4}}>
                {adminText(n.title)}
              </h2>
              <p className="adm-section-help" style={{margin: 0}}>
                {adminText(n.body)}
              </p>
              <p className="adm-meta-line">
                {n.createdAt ? formatAdminDateTime(n.createdAt) : ''}
                {n.type ? ` · ${n.type}` : ''}
              </p>
            </div>
            <div className="cms-report-actions">
              {n.href ? (
                <Link href={n.href} className="adm-btn-ghost">{adminText("Open")}</Link>
              ) : null}
              {!n.readAt ? (
                <button type="button" className="adm-btn-ghost" onClick={() => markRead(n.id)}>{adminText("Mark read")}</button>
              ) : null}
            </div>
          </div>
        </section>
      ))}

      {!items.length ? (
        <div className="adm-card">
          <p className="adm-section-help" style={{margin: 0}}>{adminText("No notifications yet. Task assignments, approval decisions, leave outcomes, and @mentions appear here.")}</p>
        </div>
      ) : null}
    </div>
  );
}
