'use client';

import Link from 'next/link';
import {useEffect, useMemo, useRef, useState} from 'react';
import {Search} from 'lucide-react';

const STATIC_LINKS = [
  {label: 'Dashboard', href: '/admin/dashboard', group: 'Navigate'},
  {label: 'Homepage', href: '/admin/homepage', group: 'Navigate'},
  {label: 'Pages', href: '/admin/pages', group: 'Navigate'},
  {label: 'Projects', href: '/admin/projects', group: 'Navigate'},
  {label: 'Services', href: '/admin/services', group: 'Navigate'},
  {label: 'Sectors', href: '/admin/sectors', group: 'Navigate'},
  {label: 'Team', href: '/admin/team', group: 'Navigate'},
  {label: 'Blog', href: '/admin/blog', group: 'Navigate'},
  {label: 'Gallery', href: '/admin/gallery', group: 'Navigate'},
  {label: 'Clients', href: '/admin/clients', group: 'Navigate'},
  {label: 'Testimonials', href: '/admin/testimonials', group: 'Navigate'},
  {label: 'Downloads', href: '/admin/downloads', group: 'Navigate'},
  {label: 'Careers', href: '/admin/careers', group: 'Navigate'},
  {label: 'Enquiries', href: '/admin/crm/enquiries', group: 'Navigate'},
  {label: 'Contacts', href: '/admin/crm/contacts', group: 'Navigate'},
  {label: 'Applications', href: '/admin/careers/applications', group: 'Navigate'},
  {label: 'Media', href: '/admin/media', group: 'Navigate'},
  {label: 'SEO', href: '/admin/seo', group: 'Navigate'},
  {label: 'Navigation', href: '/admin/navigation', group: 'Navigate'},
  {label: 'Settings', href: '/admin/settings', group: 'Navigate'},
  {label: 'Users', href: '/admin/users', group: 'Navigate'},
];

export default function AdminSearch({open, onClose, links = STATIC_LINKS}) {
  const [query, setQuery] = useState('');
  const [remote, setRemote] = useState([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setQuery('');
    setRemote([]);
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const q = query.trim();
    if (q.length < 2) {
      setRemote([]);
      return undefined;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
          credentials: 'same-origin',
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => ({}));
        const items = Array.isArray(data?.results) ? data.results : [];
        setRemote(items);
      } catch {
        // Endpoint may not exist yet — static links still work.
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const staticHits = !q
      ? links.slice(0, 8)
      : links.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.href.toLowerCase().includes(q),
        );

    const remoteHits = remote.map((item) => ({
      label: item.title || item.label || 'Result',
      href: item.href || '#',
      group: item.group || 'Results',
      hint: item.type || item.hint,
    }));

    return [...remoteHits, ...staticHits];
  }, [links, query, remote]);

  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      }
      if (event.key === 'Enter' && filtered[active]?.href) {
        event.preventDefault();
        window.location.assign(filtered[active].href);
        onClose?.();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, filtered, active]);

  if (!open) return null;

  const groups = filtered.reduce((acc, item) => {
    const key = item.group || 'Navigate';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  let flatIndex = -1;

  return (
    <div className="cms-overlay" role="presentation" onClick={onClose}>
      <div
        className="cms-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Search admin"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cms-palette-input-wrap">
          <Search size={18} aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            placeholder="Search pages and content…"
            aria-label="Search"
          />
        </div>
        <div className="cms-palette-list">
          {filtered.length === 0 ? (
            <div className="cms-palette-empty">No results</div>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <div className="cms-palette-group">{group}</div>
                {items.map((item) => {
                  flatIndex += 1;
                  const index = flatIndex;
                  return (
                    <Link
                      key={`${item.href}-${item.label}-${index}`}
                      href={item.href}
                      className={`cms-palette-item${index === active ? ' is-active' : ''}`}
                      onClick={onClose}
                      onMouseEnter={() => setActive(index)}
                    >
                      {item.label}
                      {item.hint ? <span>{item.hint}</span> : null}
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
