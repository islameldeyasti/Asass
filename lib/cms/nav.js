/**
 * Admin navigation — modules gated by permissions.
 * Grouping is applied in AdminAppShell.
 */

import {PERMS} from './permissions';

export const ADMIN_NAV = [
  {href: '/admin/dashboard', label: 'Dashboard', permission: PERMS.DASHBOARD, group: 'overview'},
  {href: '/admin/homepage', label: 'Homepage', permission: PERMS.HOMEPAGE_READ, group: 'content'},
  {href: '/admin/pages', label: 'Pages', permission: PERMS.PAGES_READ, group: 'content'},
  {href: '/admin/projects', label: 'Projects', permission: PERMS.PROJECTS_READ, group: 'content'},
  {href: '/admin/services', label: 'Services', permission: PERMS.SERVICES_READ, group: 'content'},
  {href: '/admin/sectors', label: 'Sectors', permission: PERMS.SECTORS_READ, group: 'content'},
  {href: '/admin/team', label: 'Team', permission: PERMS.TEAM_READ, group: 'content'},
  {href: '/admin/blog', label: 'Blog', permission: PERMS.BLOG_READ, group: 'content'},
  {href: '/admin/gallery', label: 'Gallery', permission: PERMS.GALLERY_READ, group: 'content'},
  {href: '/admin/clients', label: 'Clients', permission: PERMS.CLIENTS_READ, group: 'content'},
  {href: '/admin/testimonials', label: 'Testimonials', permission: PERMS.TESTIMONIALS_READ, group: 'content'},
  {href: '/admin/downloads', label: 'Downloads', permission: PERMS.DOWNLOADS_READ, group: 'content'},
  {href: '/admin/careers', label: 'Jobs', permission: PERMS.CAREERS_READ, group: 'content'},
  {href: '/admin/crm/enquiries', label: 'Enquiries', permission: PERMS.ENQUIRIES_READ, group: 'crm'},
  {href: '/admin/crm/contacts', label: 'Contacts', permission: PERMS.ENQUIRIES_READ, group: 'crm'},
  {
    href: '/admin/careers/applications',
    label: 'Applications',
    permission: PERMS.APPLICATIONS_READ,
    group: 'crm',
  },
  {href: '/admin/media', label: 'Media Library', permission: PERMS.MEDIA_READ, group: 'media'},
  {href: '/admin/seo', label: 'SEO Overview', permission: PERMS.SEO_READ, group: 'seo'},
  {
    href: '/admin/corporate/letterheads',
    label: 'Letterhead Studio',
    permission: PERMS.LETTERHEADS_READ,
    group: 'corporate',
  },
  {
    href: '/admin/corporate/employee-cards',
    label: 'Employee Cards',
    permission: PERMS.EMPLOYEE_CARDS_READ,
    group: 'corporate',
  },
  {href: '/admin/navigation', label: 'Navigation', permission: PERMS.NAVIGATION_READ, group: 'site'},
  {href: '/admin/footer', label: 'Footer', permission: PERMS.NAVIGATION_READ, group: 'site'},
  {href: '/admin/settings', label: 'General', permission: PERMS.SETTINGS_READ, group: 'settings'},
  {
    href: '/admin/settings/branding',
    label: 'Branding',
    permission: PERMS.SETTINGS_READ,
    group: 'settings',
  },
  {
    href: '/admin/settings/contact',
    label: 'Contact',
    permission: PERMS.SETTINGS_READ,
    group: 'settings',
  },
  {
    href: '/admin/settings/social',
    label: 'Social',
    permission: PERMS.SETTINGS_READ,
    group: 'settings',
  },
  {href: '/admin/reports', label: 'Reports', permission: PERMS.DASHBOARD, group: 'system'},
  {href: '/admin/users', label: 'Users', permission: PERMS.USERS_READ, group: 'system'},
];
