/**
 * ASAS CMS roles & permissions.
 * Super admin has every permission implicitly.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  FINANCE_MANAGER: 'finance_manager',
  FINANCE_CLERK: 'finance_clerk',
  SALES_MANAGER: 'sales_manager',
  PURCHASE_MANAGER: 'purchase_manager',
  PAYROLL_MANAGER: 'payroll_manager',
  EDITOR: 'editor',
  SEO_MANAGER: 'seo_manager',
  HR: 'hr',
  VIEWER: 'viewer',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.FINANCE_MANAGER]: 'Finance Manager',
  [ROLES.FINANCE_CLERK]: 'Finance Clerk',
  [ROLES.SALES_MANAGER]: 'Sales Manager',
  [ROLES.PURCHASE_MANAGER]: 'Purchasing Manager',
  [ROLES.PAYROLL_MANAGER]: 'Payroll Manager',
  [ROLES.EDITOR]: 'Editor',
  [ROLES.SEO_MANAGER]: 'SEO Manager',
  [ROLES.HR]: 'HR',
  [ROLES.VIEWER]: 'Viewer',
};

/** Permission keys used across admin APIs and nav. */
export const PERMS = {
  DASHBOARD: 'dashboard.view',
  TEAM_READ: 'team.read',
  TEAM_WRITE: 'team.write',
  BLOG_READ: 'blog.read',
  BLOG_WRITE: 'blog.write',
  PROJECTS_READ: 'projects.read',
  PROJECTS_WRITE: 'projects.write',
  SERVICES_READ: 'services.read',
  SERVICES_WRITE: 'services.write',
  SECTORS_READ: 'sectors.read',
  SECTORS_WRITE: 'sectors.write',
  GALLERY_READ: 'gallery.read',
  GALLERY_WRITE: 'gallery.write',
  VIDEOS_READ: 'videos.read',
  VIDEOS_WRITE: 'videos.write',
  CLIENTS_READ: 'clients.read',
  CLIENTS_WRITE: 'clients.write',
  TESTIMONIALS_READ: 'testimonials.read',
  TESTIMONIALS_WRITE: 'testimonials.write',
  CAREERS_READ: 'careers.read',
  CAREERS_WRITE: 'careers.write',
  APPLICATIONS_READ: 'applications.read',
  DOWNLOADS_READ: 'downloads.read',
  DOWNLOADS_WRITE: 'downloads.write',
  HOMEPAGE_READ: 'homepage.read',
  HOMEPAGE_WRITE: 'homepage.write',
  PAGES_READ: 'pages.read',
  PAGES_WRITE: 'pages.write',
  NAVIGATION_READ: 'navigation.read',
  NAVIGATION_WRITE: 'navigation.write',
  MEDIA_READ: 'media.read',
  MEDIA_WRITE: 'media.write',
  ENQUIRIES_READ: 'enquiries.read',
  ENQUIRIES_WRITE: 'enquiries.write',
  REDIRECTS_READ: 'redirects.read',
  REDIRECTS_WRITE: 'redirects.write',
  SEO_READ: 'seo.read',
  SEO_WRITE: 'seo.write',
  USERS_READ: 'users.read',
  USERS_WRITE: 'users.write',
  SETTINGS_READ: 'settings.read',
  SETTINGS_WRITE: 'settings.write',
  CORPORATE_VIEW: 'corporate.view',
  LETTERHEADS_READ: 'letterheads.read',
  LETTERHEADS_WRITE: 'letterheads.write',
  EMPLOYEE_CARDS_READ: 'employee_cards.read',
  EMPLOYEE_CARDS_WRITE: 'employee_cards.write',
  EMPLOYEE_CARDS_PUBLISH: 'employee_cards.publish',
  /** Operations Platform (internal ERP modules) — separate from website CMS content. */
  OPS_VIEW: 'ops.view',
  OPS_EMPLOYEES_READ: 'ops.employees.read',
  OPS_EMPLOYEES_WRITE: 'ops.employees.write',
  OPS_DEPARTMENTS_READ: 'ops.departments.read',
  OPS_DEPARTMENTS_WRITE: 'ops.departments.write',
  OPS_PROJECTS_READ: 'ops.projects.read',
  OPS_PROJECTS_WRITE: 'ops.projects.write',
  OPS_CLIENTS_READ: 'ops.clients.read',
  OPS_CLIENTS_WRITE: 'ops.clients.write',
  OPS_TASKS_READ: 'ops.tasks.read',
  OPS_TASKS_WRITE: 'ops.tasks.write',
  OPS_DOCS_READ: 'ops.docs.read',
  OPS_DOCS_WRITE: 'ops.docs.write',
  OPS_APPROVALS_READ: 'ops.approvals.read',
  OPS_APPROVALS_WRITE: 'ops.approvals.write',
  OPS_MEETINGS_READ: 'ops.meetings.read',
  OPS_MEETINGS_WRITE: 'ops.meetings.write',
  OPS_HR_READ: 'ops.hr.read',
  OPS_HR_WRITE: 'ops.hr.write',
  OPS_REPORTS: 'ops.reports',
  ERP_VIEW: 'erp.view',
};

const ROLE_PERMS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMS),
  [ROLES.EDITOR]: [
    PERMS.DASHBOARD,
    PERMS.HOMEPAGE_READ,
    PERMS.HOMEPAGE_WRITE,
    PERMS.PAGES_READ,
    PERMS.PAGES_WRITE,
    PERMS.TEAM_READ,
    PERMS.TEAM_WRITE,
    PERMS.BLOG_READ,
    PERMS.BLOG_WRITE,
    PERMS.PROJECTS_READ,
    PERMS.PROJECTS_WRITE,
    PERMS.SERVICES_READ,
    PERMS.SERVICES_WRITE,
    PERMS.SECTORS_READ,
    PERMS.SECTORS_WRITE,
    PERMS.GALLERY_READ,
    PERMS.GALLERY_WRITE,
    PERMS.VIDEOS_READ,
    PERMS.VIDEOS_WRITE,
    PERMS.CLIENTS_READ,
    PERMS.CLIENTS_WRITE,
    PERMS.TESTIMONIALS_READ,
    PERMS.TESTIMONIALS_WRITE,
    PERMS.DOWNLOADS_READ,
    PERMS.DOWNLOADS_WRITE,
    PERMS.NAVIGATION_READ,
    PERMS.NAVIGATION_WRITE,
    PERMS.MEDIA_READ,
    PERMS.MEDIA_WRITE,
    PERMS.ENQUIRIES_READ,
    PERMS.SETTINGS_READ,
    PERMS.SEO_READ,
    PERMS.CORPORATE_VIEW,
    PERMS.LETTERHEADS_READ,
    PERMS.LETTERHEADS_WRITE,
    PERMS.EMPLOYEE_CARDS_READ,
    PERMS.EMPLOYEE_CARDS_WRITE,
  ],
  [ROLES.SEO_MANAGER]: [
    PERMS.DASHBOARD,
    PERMS.SEO_READ,
    PERMS.SEO_WRITE,
    PERMS.REDIRECTS_READ,
    PERMS.REDIRECTS_WRITE,
    PERMS.PAGES_READ,
    PERMS.HOMEPAGE_READ,
    PERMS.NAVIGATION_READ,
    PERMS.BLOG_READ,
    PERMS.PROJECTS_READ,
    PERMS.SERVICES_READ,
    PERMS.SECTORS_READ,
    PERMS.TEAM_READ,
    PERMS.GALLERY_READ,
    PERMS.VIDEOS_READ,
    PERMS.MEDIA_READ,
  ],
  [ROLES.HR]: [
    PERMS.DASHBOARD,
    PERMS.CAREERS_READ,
    PERMS.CAREERS_WRITE,
    PERMS.APPLICATIONS_READ,
    PERMS.ENQUIRIES_READ,
    PERMS.TEAM_READ,
    PERMS.TEAM_WRITE,
    PERMS.MEDIA_READ,
    PERMS.CORPORATE_VIEW,
    PERMS.LETTERHEADS_READ,
    PERMS.LETTERHEADS_WRITE,
    PERMS.EMPLOYEE_CARDS_READ,
    PERMS.EMPLOYEE_CARDS_WRITE,
    PERMS.EMPLOYEE_CARDS_PUBLISH,
    PERMS.OPS_VIEW,
    PERMS.OPS_EMPLOYEES_READ,
    PERMS.OPS_EMPLOYEES_WRITE,
    PERMS.OPS_DEPARTMENTS_READ,
    PERMS.OPS_DEPARTMENTS_WRITE,
    PERMS.OPS_HR_READ,
    PERMS.OPS_HR_WRITE,
    PERMS.OPS_REPORTS,
    PERMS.OPS_PROJECTS_READ,
  ],
  [ROLES.VIEWER]: [
    PERMS.DASHBOARD,
    PERMS.HOMEPAGE_READ,
    PERMS.PAGES_READ,
    PERMS.TEAM_READ,
    PERMS.BLOG_READ,
    PERMS.PROJECTS_READ,
    PERMS.SERVICES_READ,
    PERMS.SECTORS_READ,
    PERMS.GALLERY_READ,
    PERMS.VIDEOS_READ,
    PERMS.CLIENTS_READ,
    PERMS.TESTIMONIALS_READ,
    PERMS.CAREERS_READ,
    PERMS.DOWNLOADS_READ,
    PERMS.NAVIGATION_READ,
    PERMS.MEDIA_READ,
    PERMS.SEO_READ,
    PERMS.SETTINGS_READ,
  ],
};

const ERP_BASE = [PERMS.DASHBOARD, PERMS.ERP_VIEW, PERMS.OPS_VIEW, PERMS.OPS_PROJECTS_READ, PERMS.OPS_CLIENTS_READ];
ROLE_PERMS[ROLES.FINANCE_MANAGER] = [...ERP_BASE, 'erp.finance.read','erp.finance.write','erp.finance.approve','erp.finance.post','erp.purchase.read','erp.assets.read','erp.assets.write','erp.assets.approve','erp.sales.read','erp.time.read','erp.time.write','erp.time.approve','erp.audit'];
ROLE_PERMS[ROLES.FINANCE_CLERK] = [...ERP_BASE, 'erp.finance.read','erp.finance.write','erp.purchase.read','erp.assets.read'];
ROLE_PERMS[ROLES.SALES_MANAGER] = [...ERP_BASE, 'erp.sales.read','erp.sales.write','erp.sales.approve'];
ROLE_PERMS[ROLES.PURCHASE_MANAGER] = [...ERP_BASE, 'erp.purchase.read','erp.purchase.write','erp.purchase.approve'];
ROLE_PERMS[ROLES.PAYROLL_MANAGER] = [...ERP_BASE, PERMS.OPS_EMPLOYEES_READ, PERMS.OPS_HR_READ, PERMS.OPS_HR_WRITE, 'erp.hr.read','erp.hr.write','erp.hr.approve','erp.time.read','erp.time.write','erp.time.approve'];

export function permissionsForRole(role) {
  return ROLE_PERMS[role] || ROLE_PERMS[ROLES.VIEWER];
}

export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  if (role === ROLES.SUPER_ADMIN) return true;
  return permissionsForRole(role).includes(permission);
}

export function hasAnyPermission(role, permissions = []) {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

export function homePathForRole(role) {
  switch (role) {
    case ROLES.FINANCE_MANAGER:
    case ROLES.FINANCE_CLERK:
      return '/admin/erp';
    case ROLES.SALES_MANAGER:
      return '/admin/erp/opportunities';
    case ROLES.PURCHASE_MANAGER:
      return '/admin/erp/purchase-orders';
    case ROLES.PAYROLL_MANAGER:
      return '/admin/erp/payroll';
    case ROLES.SEO_MANAGER:
      return '/admin/seo';
    case ROLES.HR:
      return '/admin/ops/employees';
    case ROLES.EDITOR:
      return '/admin/dashboard';
    case ROLES.VIEWER:
      return '/admin/dashboard';
    default:
      return '/admin/dashboard';
  }
}
