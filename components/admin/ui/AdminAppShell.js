'use client';
import {adminText} from '@/lib/admin/translate';
import {useAdminLang} from '@/components/admin/ui/AdminLangRoot';


import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useMemo, useRef, useState} from 'react';
import {
  Activity,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Coins,
  Contact,
  CreditCard,
  Download,
  ExternalLink,
  Factory,
  FileSignature,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  Footprints,
  GitBranch,
  Globe,
  Handshake,
  HardHat,
  Hash,
  HeartPulse,
  Home,
  IdCard,
  Image,
  Images,
  Inbox,
  Landmark,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Newspaper,
  Network,
  Palette,
  PenLine,
  Phone,
  PieChart,
  Plus,
  Quote,
  Receipt,
  Scale,
  ScrollText,
  Search,
  Settings,
  Share2,
  Shield,
  ShoppingCart,
  Sun,
  Timer,
  Truck,
  UserRound,
  Users,
  Video,
  Wallet,
  Warehouse,
  Wrench,
} from 'lucide-react';
import CommandPalette from '@/components/admin/ui/CommandPalette';
import AdminSearch from '@/components/admin/ui/AdminSearch';
import AdminLanguageSwitcher from '@/components/admin/ui/AdminLanguageSwitcher';

const SIDEBAR_KEY = 'asas-cms-sidebar';
const MENU_OPEN_KEY = 'asas-cms-menu-accordion';

const ICON_BY_HREF = {
  '/admin/dashboard': LayoutDashboard,
  '/admin/profile': UserRound,
  '/admin/homepage': Home,
  '/admin/pages': FileText,
  '/admin/projects': FolderKanban,
  '/admin/services': Wrench,
  '/admin/sectors': Factory,
  '/admin/team': Users,
  '/admin/blog': Newspaper,
  '/admin/gallery': Images,
  '/admin/videos': Video,
  '/admin/clients': Handshake,
  '/admin/testimonials': Quote,
  '/admin/downloads': Download,
  '/admin/careers': HardHat,
  '/admin/careers/applications': Inbox,
  '/admin/media': Image,
  '/admin/seo': Globe,
  '/admin/navigation': LayoutTemplate,
  '/admin/footer': Footprints,
  '/admin/settings': Settings,
  '/admin/settings/branding': Palette,
  '/admin/settings/contact': Phone,
  '/admin/settings/social': Hash,
  '/admin/reports': PieChart,
  '/admin/users': Shield,
  '/admin/enquiries': MessageSquare,
  '/admin/crm/enquiries': MessageSquare,
  '/admin/crm/contacts': Contact,
  '/admin/corporate/letterheads': PenLine,
  '/admin/corporate/employee-cards': IdCard,
  '/admin/erp': Landmark,
  '/admin/erp/opportunities': BriefcaseBusiness,
  '/admin/erp/quotations': FileSpreadsheet,
  '/admin/erp/contracts': FileSignature,
  '/admin/erp/vendors': Truck,
  '/admin/erp/purchase-orders': ShoppingCart,
  '/admin/erp/invoices': Receipt,
  '/admin/erp/bills': Wallet,
  '/admin/erp/expenses': CreditCard,
  '/admin/erp/payments': Banknote,
  '/admin/erp/reconciliation': Scale,
  '/admin/erp/budgets': Calculator,
  '/admin/erp/journals': BookOpen,
  '/admin/erp/reports': BarChart3,
  '/admin/erp/time-entries': Timer,
  '/admin/erp/payroll': Coins,
  '/admin/erp/assets': Warehouse,
  '/admin/erp/settings': Building2,
  '/admin/erp/audit': ScrollText,
  '/admin/ops': Layers,
  '/admin/ops/dashboard': LayoutDashboard,
  '/admin/ops/employees': UserRound,
  '/admin/ops/departments': Building2,
  '/admin/ops/org-chart': Network,
  '/admin/ops/clients': Handshake,
  '/admin/ops/projects': FolderKanban,
  '/admin/ops/workflows': GitBranch,
  '/admin/ops/tasks': ClipboardList,
  '/admin/ops/approvals': CheckSquare,
  '/admin/ops/leave': CalendarDays,
  '/admin/ops/attendance': Clock,
  '/admin/ops/workload': HeartPulse,
  '/admin/ops/notifications': Bell,
  '/admin/ops/reports': PieChart,
  '/admin/ops/audit': Activity,
};

const NAV_GROUPS = [
  {id:'erp',label:'ERP',hrefs:['/admin/erp']},
  {id:'erp-sales',label:'Sales',hrefs:['/admin/erp/opportunities','/admin/erp/quotations','/admin/erp/contracts']},
  {id:'erp-purchase',label:'Purchasing',hrefs:['/admin/erp/vendors','/admin/erp/purchase-orders']},
  {id:'erp-finance',label:'Finance',hrefs:['/admin/erp/invoices','/admin/erp/bills','/admin/erp/expenses','/admin/erp/payments','/admin/erp/reconciliation','/admin/erp/budgets','/admin/erp/journals','/admin/erp/reports']},
  {id:'erp-people',label:'People & assets',hrefs:['/admin/erp/time-entries','/admin/erp/payroll','/admin/erp/assets']},
  {id:'erp-control',label:'ERP control',hrefs:['/admin/erp/settings','/admin/erp/audit']},
  {
    id: 'operations',
    label: 'Delivery',
    hrefs: [
      '/admin/ops',
      '/admin/ops/dashboard',
      '/admin/ops/clients',
      '/admin/ops/projects',
      '/admin/ops/workflows',
      '/admin/ops/tasks',
      '/admin/ops/approvals',
      '/admin/ops/notifications',
      '/admin/ops/reports',
      '/admin/ops/audit',
    ],
  },
  {
    id: 'people',
    label: 'People',
    hrefs: [
      '/admin/ops/employees',
      '/admin/ops/departments',
      '/admin/ops/org-chart',
      '/admin/ops/leave',
      '/admin/ops/attendance',
      '/admin/ops/workload',
    ],
  },
  {
    id: 'content',
    label: 'Website',
    hrefs: [
      '/admin/homepage',
      '/admin/pages',
      '/admin/projects',
      '/admin/services',
      '/admin/sectors',
      '/admin/team',
      '/admin/blog',
      '/admin/gallery',
      '/admin/videos',
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
    label: 'Corporate',
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

const MENU_FAMILIES = [
  {id: 'website', label: 'Website', groupIds: ['content', 'crm', 'media', 'corporate', 'seo', 'site']},
  {id: 'overview', label: 'Overview', groupIds: ['overview']},
  {id: 'erp', label: 'ERP', groupIds: ['erp', 'erp-sales', 'erp-purchase', 'erp-finance', 'erp-people', 'erp-control']},
  {id: 'ops', label: 'Operations', groupIds: ['operations', 'people']},
  {id: 'admin', label: 'Settings', groupIds: ['settings', 'system']},
];

const GROUP_ICONS = {
  overview: LayoutDashboard,
  erp: Landmark,
  'erp-sales': BriefcaseBusiness,
  'erp-purchase': ShoppingCart,
  'erp-finance': Wallet,
  'erp-people': Timer,
  'erp-control': Settings,
  operations: Layers,
  people: UserRound,
  content: Newspaper,
  crm: MessageSquare,
  media: Image,
  corporate: IdCard,
  seo: Globe,
  site: LayoutTemplate,
  settings: Settings,
  system: Shield,
  more: FileText,
};

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
  const profile = byHref.get('/admin/profile');
  const overviewItems = [dashboard, profile].filter(Boolean);
  if (overviewItems.length) {
    overviewItems.forEach((item) => used.add(item.href));
    groups.push({id: 'overview', label: 'Overview', items: overviewItems});
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

  const system = groups.find((g) => g.id === 'system');
  const hasDashboard = used.has('/admin/dashboard') || Boolean(byHref.get('/admin/dashboard'));
  if (hasDashboard && system && !system.items.some((i) => i.href.includes('#activity'))) {
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


const NAV_EVENT = "asas-admin-nav";

function openAdminNav() {
  window.dispatchEvent(new CustomEvent(NAV_EVENT, {detail: {open: true}}));
}

export default function AdminAppShell({user, navItems = []}) {
  useAdminLang();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(SIDEBAR_KEY, "expanded");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onNav(event) {
      setMobileOpen(Boolean(event.detail?.open));
    }
    window.addEventListener(NAV_EVENT, onNav);
    return () => window.removeEventListener(NAV_EVENT, onNav);
  }, []);

  const groups = useMemo(() => groupNavItems(navItems), [navItems]);

  function isItemActive(item) {
    if (!item?.href || item.href.includes("#")) return false;
    return (
      pathname === item.href ||
      (!["/admin/ops", "/admin/erp"].includes(item.href) && pathname.startsWith(`${item.href}/`))
    );
  }

  const usedFamilyIds = new Set(MENU_FAMILIES.flatMap((family) => family.groupIds));
  const leftoverGroups = groups.filter((group) => !usedFamilyIds.has(group.id));
  const menuGroups = [
    ...MENU_FAMILIES.flatMap((family) => family.groupIds.map((id) => groups.find((group) => group.id === id)).filter(Boolean)),
    ...leftoverGroups,
  ];

  const routeGroupId = menuGroups.find((group) => group.items.some(isItemActive))?.id || null;

  useEffect(() => {
    if (routeGroupId) setOpenId(routeGroupId);
  }, [pathname, routeGroupId]);

  useEffect(() => {
    try {
      if (openId) window.localStorage.setItem(MENU_OPEN_KEY, openId);
    } catch {
      // ignore
    }
  }, [openId]);

  function isGroupOpen(groupId) {
    return (openId ?? routeGroupId) === groupId;
  }

  function toggleGroup(groupId) {
    setOpenId((prev) => ((prev ?? routeGroupId) === groupId ? "" : groupId));
  }

  const sidebarClass = ["cms-navframe", mobileOpen ? "is-open" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {mobileOpen ? (
        <div className="cms-overlay" style={{zIndex: 25}} onClick={() => setMobileOpen(false)} aria-hidden />
      ) : null}

      <aside className={sidebarClass} aria-label={adminText("Admin navigation")} suppressHydrationWarning>
        <div className="cms-menu-head">
          <div className="cms-sidebar-logo" aria-hidden>
            {adminText("AS")}
          </div>
          <strong>{adminText("Menu")}</strong>
        </div>
        <nav className="cms-menu-nav">
          {menuGroups.map((group) => {
            const open = isGroupOpen(group.id);
            const GroupIcon = GROUP_ICONS[group.id] || iconFor(group.items[0]?.href);
            const current = group.items.some(isItemActive);
            return (
              <div
                key={group.id}
                data-menu-group={group.id}
                className={`cms-menu-dropdown${open ? " is-open" : ""}${current ? " is-current" : ""}`}
              >
                <button
                  type="button"
                  className={`cms-menu-dropdown-btn${open ? " is-open" : ""}${current ? " is-current" : ""}`}
                  aria-expanded={open}
                  title={adminText(group.label)}
                  onClick={() => toggleGroup(group.id)}
                >
                  <GroupIcon size={16} aria-hidden />
                  <span>{adminText(group.label)}</span>
                  {open ? <ChevronDown className="cms-menu-chevron" size={16} aria-hidden /> : <ChevronRight className="cms-menu-chevron" size={16} aria-hidden />}
                </button>
                {open ? (
                  <div className="cms-menu-dropdown-items">
                    {group.items.map((item) => {
                      const Icon = item.href.includes("#activity") ? Activity : iconFor(item.href);
                      const active = isItemActive(item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`cms-nav-link${active ? " is-active" : ""}${item.comingSoon ? " is-soon" : ""}`}
                          title={adminText(item.label)}
                          onClick={() => setMobileOpen(false)}
                        >
                          <Icon aria-hidden />
                          <span>{adminText(item.label)}</span>
                          {item.comingSoon ? <em>{adminText("Soon")}</em> : null}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
        <div className="cms-menu-foot">
          <div className="cms-sidebar-avatar" aria-hidden>
            {user?.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoUrl} alt="" />
            ) : (
              adminText(initials(user?.name))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export function AdminTopbar({user, navItems = []}) {
  const {lang, theme, setTheme} = useAdminLang();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const hasNotifications = navItems.some((item) => item.href === "/admin/ops/notifications");
  const allowedHrefs = useMemo(() => navItems.map((item) => item.href), [navItems]);
  const paletteActions = useMemo(
    () =>
      QUICK_CREATE_ACTIONS.filter((action) =>
        allowedHrefs.some(
          (href) => action.href === href || action.href.startsWith(`${href}/`) || action.href.startsWith(`${href}?`),
        ),
      ),
    [allowedHrefs],
  );
  const searchLinks = useMemo(
    () => navItems.map((item) => ({label: item.label, href: item.href, group: "Navigate"})),
    [navItems],
  );

  useEffect(() => {
    function onKey(event) {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "k") {
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onClick(event) {
      if (!userMenuRef.current?.contains(event.target)) setUserMenuOpen(false);
    }
    if (userMenuOpen) {
      window.addEventListener("mousedown", onClick);
      return () => window.removeEventListener("mousedown", onClick);
    }
    return undefined;
  }, [userMenuOpen]);

  async function signOut() {
    await fetch("/api/admin/auth", {method: "DELETE"});
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <>
      <header className="cms-topbar">
        <button
          type="button"
          className="cms-icon-btn cms-mobile-menu-btn"
          aria-label={adminText("Open menu")}
          onClick={() => openAdminNav()}
        >
          <Menu size={16} />
        </button>
        <div className="cms-topbar-grow" />
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
            <span>{adminText("Search")}</span>
            <kbd>{adminText("⌘K")}</kbd>
          </button>
          <button
            type="button"
            className="cms-icon-btn is-primary"
            aria-label={adminText("Quick create")}
            onClick={() => {
              setSearchOpen(false);
              setPaletteOpen(true);
            }}
          >
            <Plus size={16} />
          </button>
          <AdminLanguageSwitcher />
          <button
            type="button"
            className="cms-icon-btn"
            aria-label={adminText(theme === "dark" ? "Switch to light mode" : "Switch to dark mode")}
            title={adminText(theme === "dark" ? "Light mode" : "Dark mode")}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {hasNotifications ? (
            <Link href="/admin/ops/notifications" className="cms-icon-btn" title={adminText("Notifications")} aria-label={adminText("Notifications")}>
              <Bell size={16} />
            </Link>
          ) : null}
          <Link
            href={lang === "ar" ? "/ar" : "/en"}
            target="_blank"
            rel="noopener noreferrer"
            className="cms-export-btn"
            title={adminText("Preview website")}
            aria-label={adminText("Preview website")}
          >
            <ExternalLink size={16} />
            {adminText("Preview website")}
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
                {user?.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoUrl} alt="" />
                ) : (
                  adminText(initials(user?.name))
                )}
              </div>
            </button>
            {userMenuOpen ? (
              <div className="cms-user-menu-panel" role="menu">
                <strong>{adminText(user?.name || "Admin")}</strong>
                <span>{adminText(user?.email || user?.role || "—")}</span>
                <Link href="/admin/profile" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                  {adminText("My profile")}
                </Link>
                <button type="button" role="menuitem" onClick={signOut}>
                  <LogOut size={14} />
                  {adminText("Sign out")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} actions={paletteActions} />
      <AdminSearch open={searchOpen} onClose={() => setSearchOpen(false)} links={searchLinks} />
    </>
  );
}
