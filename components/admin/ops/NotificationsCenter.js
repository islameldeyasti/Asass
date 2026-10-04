'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {
  AtSign,
  Bell,
  CalendarDays,
  CheckCheck,
  ClipboardCheck,
  ClipboardList,
  Inbox,
  Search,
} from 'lucide-react';
import {adminText} from '@/lib/admin/translate';
import {formatAdminDateTime} from '@/lib/admin/locale';

const FILTERS = [
  {id: 'all', label: 'All'},
  {id: 'unread', label: 'Unread'},
  {id: 'approval', label: 'Approvals'},
  {id: 'mention', label: 'Mentions'},
  {id: 'task', label: 'Tasks'},
  {id: 'leave', label: 'Leave'},
];

function typeMeta(type) {
  const key = String(type || 'info').toLowerCase();
  if (key === 'approval') return {label: 'Approval', icon: ClipboardCheck, tone: 'approval'};
  if (key === 'mention') return {label: 'Mention', icon: AtSign, tone: 'mention'};
  if (key === 'task') return {label: 'Task', icon: ClipboardList, tone: 'task'};
  if (key === 'leave') return {label: 'Leave', icon: CalendarDays, tone: 'leave'};
  return {label: key === 'info' ? 'Update' : key, icon: Bell, tone: 'info'};
}

export default function NotificationsCenter({initialItems = [], initialUnread = 0}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [unread, setUnread] = useState(initialUnread);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    setItems(initialItems);
    setUnread(initialUnread);
  }, [initialItems, initialUnread]);

  const counts = useMemo(() => {
    const next = {all: items.length, unread: 0};
    for (const item of items) {
      if (!item.readAt) next.unread += 1;
      const type = String(item.type || 'info');
      next[type] = (next[type] || 0) + 1;
    }
    return next;
  }, [items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const unreadOnly = filter === 'unread';
      const typeOnly = FILTERS.some((entry) => entry.id === filter && !['all', 'unread'].includes(entry.id));
      if (unreadOnly && item.readAt) return false;
      if (typeOnly && String(item.type || '') !== filter) return false;
      if (!q) return true;
      return [item.title, item.body, item.type].some((value) => String(value || '').toLowerCase().includes(q));
    });
  }, [items, query, filter]);

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
    setBusy(id);
    const res = await fetch('/api/admin/ops', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({resource: 'notification-read', document: {id}}),
    });
    const data = await res.json();
    setBusy('');
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    await refresh();
  }

  async function markAll() {
    setError('');
    setBusy('all');
    const res = await fetch('/api/admin/ops', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({resource: 'notifications-read-all', document: {}}),
    });
    const data = await res.json();
    setBusy('');
    if (!res.ok) {
      setError(data.error || 'Failed');
      return;
    }
    await refresh();
  }

  return (
    <div className="ops-notif">
      <div className="ops-notif-metrics">
        <div className="ops-notif-metric">
          <span>{adminText('Unread')}</span>
          <strong>{unread}</strong>
        </div>
        <div className="ops-notif-metric">
          <span>{adminText('Total')}</span>
          <strong>{items.length}</strong>
        </div>
        <div className="ops-notif-metric">
          <span>{adminText('Showing')}</span>
          <strong>{visible.length}</strong>
        </div>
      </div>

      <div className="ops-notif-toolbar">
        <label className="table-data-search">
          <span className="table-data-search-icon" aria-hidden="true">
            <Search size={16} strokeWidth={2} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={adminText('Search notifications…')}
            aria-label={adminText('Search')}
          />
        </label>
        <button
          type="button"
          className="table-data-btn table-data-btn-excel"
          onClick={markAll}
          disabled={!unread || busy === 'all'}
        >
          <CheckCheck size={16} />
          {adminText(busy === 'all' ? 'Updating…' : 'Mark all read')}
        </button>
      </div>

      <div className="ops-notif-filters" role="tablist" aria-label={adminText('Notification filters')}>
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={filter === entry.id}
            className={filter === entry.id ? 'is-active' : ''}
            onClick={() => setFilter(entry.id)}
          >
            {adminText(entry.label)}
            <em>{counts[entry.id] || 0}</em>
          </button>
        ))}
      </div>

      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      {!visible.length ? (
        <div className="ops-notif-empty">
          <Inbox size={28} />
          <strong>{adminText(items.length ? 'No matching notifications' : 'Inbox is clear')}</strong>
          <p>
            {adminText(
              items.length
                ? 'Try another filter or search term.'
                : 'Task assignments, approval decisions, leave outcomes, and @mentions appear here.',
            )}
          </p>
        </div>
      ) : (
        <div className="ops-notif-list">
          {visible.map((item) => {
            const meta = typeMeta(item.type);
            const Icon = meta.icon;
            const unreadItem = !item.readAt;
            return (
              <article key={item.id} className={`ops-notif-item${unreadItem ? ' is-unread' : ''}`}>
                <span className={`ops-notif-icon tone-${meta.tone}`}>
                  <Icon size={16} />
                </span>
                <div className="ops-notif-copy">
                  <header>
                    <h2>{item.title}</h2>
                    {unreadItem ? <span className="ops-notif-dot" /> : null}
                    <span className={`ops-pill tone-${meta.tone}`}>{adminText(meta.label)}</span>
                  </header>
                  {item.body ? <p>{item.body}</p> : null}
                  <time>{item.createdAt ? formatAdminDateTime(item.createdAt) : ''}</time>
                </div>
                <div className="ops-notif-actions">
                  {item.href ? (
                    <Link href={item.href} className="ops-notif-open">
                      {adminText('Open')}
                    </Link>
                  ) : null}
                  {unreadItem ? (
                    <button type="button" disabled={busy === item.id} onClick={() => markRead(item.id)}>
                      {adminText(busy === item.id ? 'Saving…' : 'Mark read')}
                    </button>
                  ) : (
                    <span className="ops-notif-read">{adminText('Read')}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
