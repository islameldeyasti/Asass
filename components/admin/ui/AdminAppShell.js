'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  Activity,
  Briefcase,
  Building2,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  FolderKanban,
  Home,
  Image,
  Images,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  PanelLeft,
  Plus,
  Quote,
  Search,
  Settings,
  Share2,
  Shield,
  IdCard,
  Users,
  Wrench,
} from 'lucide-react';
import CommandPalette from '@/components/admin/ui/CommandPalette';
import AdminSearch from '@/components/admin/ui/AdminSearch';
import PageHeader from '@/components/admin/ui/PageHeader';

const SIDEBAR_KEY = 'asas-cms-sidebar';

const ICON_BY_HREF = {
  '/admin/dashboard': LayoutDashboard,
  '/admin/homepage': Home,
  '/admin/pages': FileText,
  '/admin/projects': FolderKanban,
  '/admin/services': Wrench,
  '/admin/sectors': Building2,
  '/admin/team': Users,
  '/admin/blog': Newspaper,
  '/admin/gallery': Images,
  '/admin/clients': Briefcase,
  '/admin/testimonials': Quote,
  '/admin/downloads': Download,
  '/admin/careers': Briefcase,
  '/admin/careers/applications': Briefcase,
  '/admin/media': Image,
  '/admin/seo': Share2,
  '/admin/navigation': LayoutTemplate,
  '/admin/settings': Settings,
  '/admin/users': Shield,
  '/admin/enquiries': MessageSquare,
  '/admin/crm/enquiries': MessageSquare,
  '/admin/crm/contacts': Users,
  '/admin/corporate/letterheads': FileText,
  '/admin/corporate/employee-cards': IdCard,
};

const NAV_GROUPS = [
  {
    id: 'content',
    label: 'Content',
    hrefs: [
      '/admin/homepage',
      '/admin/pages',
      '/admin/projects',
      '/admin/services',
      '/admin/sectors',
      '/admin/team',
      '/admin/blog',
      '/admin/gallery',
      '/admin/clients',
      '/admin/testimonials',
      '/admin/downloads',
      '/admin/careers',
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    hrefs: [
      '/admin/crm/enquiries',
      '/admin/crm/contacts',
      '/admin/careers/applications',
    ],
  },
  {
    id: 'media',
    label: 'Media',
    hrefs: ['/admin/media'],
  },
  {
    id: 'corporate',
    label: 'Corporate Tools',
    hrefs: ['/admin/corporate/letterheads', '/admin/corporate/employee-cards'],
  },
  {
    id: 'seo',
    label: 'SEO',
    hrefs: ['/admin/seo'],
  },
  {
    id: 'site',
    label: 'Site',
    hrefs: ['/admin/navigation', '/admin/footer'],
  },
  {
    id: 'settings',
    label: 'Settings',
    hrefs: [
      '/admin/settings',
      '/admin/settings/branding',
      '/admin/settings/contact',
      '/admin/settings/social',
    ],
  },
  {
    id: 'system',
    label: 'System',
    hrefs: ['/admin/reports', '/admin/users'],
  },
];

const QUICK_CREATE_ACTIONS = [
  {label: 'Create project', href: '/admin/projects', hint: 'Projects', icon: FolderKanban},
  {label: 'New blog post', href: '/admin/blog', hint: 'Blog', icon: Newspaper},
  {label: 'Upload media', href: '/admin/media', hint: 'Media', icon: Image},
  {label: 'Add team member', href: '/admin/team/new', hint: 'Team', icon: Users},
  {label: 'New letterhead', href: '/admin/corporate/letterheads?new=1', hint: 'Corporate Tools', icon: FileText},
  {label: 'Employee Cards', href: '/admin/corporate/employee-cards/new', hint: 'Corporate Tools', icon: IdCard},
  {label: 'New page', href: '/admin/pages', hint: 'Pages', icon: FileText},
  {label: 'Site settings', href: '/admin/settings', hint: 'Settings', icon: Settings},
];

function iconFor(href) {
  if (ICON_BY_HREF[href]) return ICON_BY_HREF[href];
  const match = Object.keys(ICON_BY_HREF).find(
    (key) => href === key || href.startsWith(`${key}/`),
  );
  return match ? ICON_BY_HREF[match] : FileText;
}

function groupNavItems(navItems) {
  const byHref = new Map(navItems.map((item) => [item.href, item]));
  const used = new Set();
  const groups = [];

  const dashboard = byHref.get('/admin/dashboard');
  if (dashboard) {
    used.add(dashboard.href);
    groups.push({id: 'overview', label: 'Overview', items: [dashboard]});
  }

  for (const group of NAV_GROUPS) {
    const items = group.hrefs.map((href) => byHref.get(href)).filter(Boolean);
    items.forEach((item) => used.add(item.href));
    if (items.length) {
      groups.push({...group, items});
    }
  }

  const leftover = navItems.filter((item) => !used.has(item.href));
  if (leftover.length) {
    groups.push({id: 'more', label: 'More', items: leftover});
  }

  // Activity shortcut under System (hash link on dashboard)
  const system = groups.find((g) => g.id === 'system');
  if (system && !system.items.some((i) => i.href.includes('#activity'))) {
    system.items = [
      ...system.items,
      {
        href: '/admin/dashboard#activity',
        label: 'Activity',
        permission: null,
        _virtual: true,
      },
    ];
  }

  return groups;
}

function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'A';
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

export default function AdminAppShell({
  user,
  navItems = [],
  children,
  title,
  subtitle,
  actions,
  breadcrumb,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SIDEBAR_KEY);
      if (stored === 'collapsed') setCollapsed(true);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event) {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (event.shiftKey) {
          setPaletteOpen(false);
          setSearchOpen((v) => !v);
          return;
        }
        setSearchOpen(false);
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    function onClick(event) {
      if (!userMenuRef.current?.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      window.addEventListener('mousedown', onClick);
      return () => window.removeEventListener('mousedown', onClick);
    }
    return undefined;
  }, [userMenuOpen]);

  const groups = useMemo(() => groupNavItems(navItems), [navItems]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? 'collapsed' : 'expanded');
      } catch {
        // ignore
      }
      return next;
    });
  }

  async function signOut() {
    await fetch('/api/admin/auth', {method: 'DELETE'});
    router.replace('/admin/login');
    router.refresh();
  }

  const crumb =
    breadcrumb ||
    (title ? (
      <nav className="cms-breadcrumb" aria-label="Breadcrumb">
        <Link href="/admin/dashboard">Admin</Link>
        <span className="cms-breadcrumb-sep" aria-hidden>
          /
        </span>
        <span className="cms-breadcrumb-current">{title}</span>
      </nav>
    ) : null);

  const sidebarClass = [
    'cms-sidebar',
    collapsed ? 'is-collapsed' : '',
    mobileOpen ? 'is-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="cms-app">
      {mobileOpen ? (
        <div
          className="cms-overlay"
          style={{zIndex: 25}}
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside className={sidebarClass} aria-label="Admin navigation">
        <div className="cms-sidebar-brand">
          <div className="cms-sidebar-logo" aria-hidden>
            AS
          </div>
          <div className="cms-sidebar-brand-text">
            <strong>ASAS CMS</strong>
            <span>Content workspace</span>
          </div>
        </div>

        <nav className="cms-sidebar-nav">
          {groups.map((group) => (
            <div key={group.id} className="cms-nav-group">
              {group.id !== 'overview' ? (
                <div className="cms-nav-group-label">{group.label}</div>
              ) : null}
              {group.items.map((item) => {
                const Icon = item.href.includes('#activity')
                  ? Activity
                  : iconFor(item.href);
                const active =
                  !item.href.includes('#') &&
                  (pathname === item.href || pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`cms-nav-link${active ? ' is-active' : ''}${
                      item.comingSoon ? ' is-soon' : ''
                    }`}
                    title={item.label}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon aria-hidden />
                    <span>{item.label}</span>
                    {item.comingSoon ? <em>Soon</em> : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="cms-sidebar-footer">
          <button
            type="button"
            className="cms-sidebar-collapse"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <PanelLeft size={16} />}
            {!collapsed ? <span>Collapse</span> : null}
          </button>
          <div className="cms-sidebar-user">
            <div className="cms-sidebar-avatar" aria-hidden>
              {initials(user?.name)}
            </div>
            <div className="cms-sidebar-user-meta">
              <strong>{user?.name || 'Admin'}</strong>
              <span>{user?.role ? user.role.split('_').join(' ') : '—'}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="cms-main">
        <header className="cms-topbar">
          <button
            type="button"
            className="cms-icon-btn cms-mobile-menu-btn"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={16} />
          </button>

          {crumb}

          <div className="cms-topbar-actions">
            <button
              type="button"
              className="cms-search-trigger"
              onClick={() => {
                setSearchOpen(false);
                setPaletteOpen(true);
              }}
            >
              <Search size={14} aria-hidden />
              <span>Search</span>
              <kbd>⌘K</kbd>
            </button>

            <button
              type="button"
              className="cms-icon-btn is-primary"
              aria-label="Quick create"
              onClick={() => {
                setSearchOpen(false);
                setPaletteOpen(true);
              }}
            >
              <Plus size={16} />
            </button>

            <Link
              href="/en"
              target="_blank"
              rel="noopener noreferrer"
              className="cms-icon-btn"
              title="Preview website"
            >
              <ExternalLink size={16} />
              <span className="cms-topbar-label">Preview</span>
            </Link>

            <div className="cms-user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="cms-icon-btn"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                <div className="cms-sidebar-avatar" style={{width: 24, height: 24, fontSize: 10}}>
                  {initials(user?.name)}
                </div>
              </button>
              {userMenuOpen ? (
                <div className="cms-user-menu-panel" role="menu">
                  <strong>{user?.name || 'Admin'}</strong>
                  <span>{user?.email || user?.role || '—'}</span>
                  <button type="button" role="menuitem" onClick={signOut}>
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <div className="cms-workspace">
          {(title || actions) && (
            <PageHeader title={title} subtitle={subtitle} actions={actions} />
          )}
          {children}
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        actions={QUICK_CREATE_ACTIONS}
      />
      <AdminSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
