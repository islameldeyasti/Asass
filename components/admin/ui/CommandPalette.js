'use client';

import Link from 'next/link';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  FilePlus2,
  FolderPlus,
  ImagePlus,
  Search,
  Settings,
  Users,
} from 'lucide-react';

const DEFAULT_ACTIONS = [
  {label: 'Create project', href: '/admin/projects', hint: 'Projects', icon: FolderPlus},
  {label: 'New blog post', href: '/admin/blog', hint: 'Blog', icon: FilePlus2},
  {label: 'Upload media', href: '/admin/media', hint: 'Media', icon: ImagePlus},
  {label: 'Add team member', href: '/admin/team/new', hint: 'Team', icon: Users},
  {label: 'Site settings', href: '/admin/settings', hint: 'Settings', icon: Settings},
];

export default function CommandPalette({open, onClose, actions = DEFAULT_ACTIONS}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.hint && item.hint.toLowerCase().includes(q)) ||
        (item.href && item.href.toLowerCase().includes(q)),
    );
  }, [actions, query]);

  useEffect(() => {
    if (!open) return undefined;
    setQuery('');
    setActive(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 10);
    return () => window.clearTimeout(t);
  }, [open]);

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
      if (event.key === 'Enter' && filtered[active]) {
        event.preventDefault();
        window.location.assign(filtered[active].href);
        onClose?.();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, filtered, active]);

  if (!open) return null;

  return (
    <div className="cms-overlay" role="presentation" onClick={onClose}>
      <div
        className="cms-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
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
            placeholder="Search actions…"
            aria-label="Search actions"
          />
        </div>
        <div className="cms-palette-list">
          {filtered.length === 0 ? (
            <div className="cms-palette-empty">No matching actions</div>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon || FilePlus2;
              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={`cms-palette-item${index === active ? ' is-active' : ''}`}
                  onClick={onClose}
                  onMouseEnter={() => setActive(index)}
                >
                  <Icon aria-hidden />
                  {item.label}
                  {item.hint ? <span>{item.hint}</span> : null}
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
