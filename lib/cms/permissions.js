/**
 * ASAS CMS roles & permissions.
 * Super admin has every permission implicitly.
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  EDITOR: 'editor',
  SEO_MANAGER: 'seo_manager',
  HR: 'hr',
  VIEWER: 'viewer',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
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
    PERMS.CLIENTS_READ,
    PERMS.TESTIMONIALS_READ,
    PERMS.CAREERS_READ,
    PERMS.DOWNLOADS_READ,
    PERMS.NAVIGATION_READ,
    PERMS.MEDIA_READ,
    PERMS.SEO_READ,
    PERMS.SETTINGS_READ,
    PERMS.CORPORATE_VIEW,
    PERMS.LETTERHEADS_READ,
    PERMS.EMPLOYEE_CARDS_READ,
  ],
};

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
