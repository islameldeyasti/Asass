/**
 * Scan CMS documents/collections for media URL references.
 * Used for Media Library usage tracking and safe delete.
 */

import {
  getBlogPosts,
  getClients,
  getDownloads,
  getGalleryItems,
  getHomepage,
  getProjects,
  getSectors,
  getServices,
  getSettings,
  getTestimonials,
  listMedia,
} from './content-service';
import {listTeamMembers} from '@/lib/team/store';
import {getSeoSettings} from './seo-store';
import {getAllPageSeo} from './seo/page-seo-store';

const URL_KEYS = new Set([
  'image',
  'cover',
  'logo',
  'src',
  'href',
  'url',
  'profile_image',
  'secondary_image',
  'ogImage',
  'defaultOgImage',
  'favicon',
  'appleTouchIcon',
  'primaryLogo',
  'lightLogo',
  'darkLogo',
  'headerLogoLight',
  'headerLogoDark',
  'footerLogo',
  'mobileLogo',
  'printLogo',
  'letterheadLogo',
  'emailLogo',
  'qrImageUrl',
]);

function pushUsage(map, url, usage) {
  if (!url || typeof url !== 'string') return;
  const key = url.trim();
  if (!key.startsWith('/')) return;
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(usage);
}

function walk(value, map, context) {
  if (value == null) return;
  if (typeof value === 'string') {
    if (context.key && URL_KEYS.has(context.key)) {
      pushUsage(map, value, {
        module: context.module,
        label: context.label,
        path: context.path,
        href: context.href,
      });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      walk(entry, map, {
        ...context,
        path: `${context.path}[${index}]`,
        key: typeof entry === 'string' ? context.key : undefined,
      });
      if (typeof entry === 'string' && (context.key === 'images' || context.key === 'gallery')) {
        pushUsage(map, entry, {
          module: context.module,
          label: `${context.label} › gallery`,
          path: `${context.path}[${index}]`,
          href: context.href,
        });
      }
    });
    return;
  }
  if (typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key === 'src' && typeof child === 'string') {
        pushUsage(map, child, {
          module: context.module,
          label: context.label,
          path: `${context.path}.${key}`,
          href: context.href,
        });
      }
      walk(child, map, {
        ...context,
        key,
        path: context.path ? `${context.path}.${key}` : key,
      });
    }
  }
}

export async function buildMediaUsageIndex() {
  const map = new Map();

  const [
    settings,
    homepage,
    projects,
    services,
    sectors,
    blog,
    clients,
    gallery,
    downloads,
    testimonials,
    team,
    media,
    seoSettings,
    pageSeo,
  ] = await Promise.all([
    getSettings().catch(() => ({})),
    getHomepage().catch(() => ({})),
    getProjects().catch(() => []),
    getServices().catch(() => []),
    getSectors().catch(() => []),
    getBlogPosts().catch(() => []),
    getClients().catch(() => []),
    getGalleryItems().catch(() => []),
    getDownloads().catch(() => []),
    getTestimonials().catch(() => []),
    listTeamMembers({includeDrafts: true}).catch(() => []),
    listMedia().catch(() => []),
    getSeoSettings().catch(() => ({})),
    getAllPageSeo().catch(() => ({entries: {}})),
  ]);

  walk(settings?.branding, map, {
    module: 'Settings → Branding',
    label: 'Brand assets',
    path: 'branding',
    href: '/admin/settings/branding',
  });

  walk(homepage, map, {
    module: 'Homepage',
    label: 'Homepage',
    path: 'homepage',
    href: '/admin/homepage',
  });

  for (const item of projects) {
    walk(item, map, {
      module: 'Projects',
      label: item.title || item.slug || item.id,
      path: `projects/${item.slug || item.id}`,
      href: '/admin/projects',
    });
  }
  for (const item of services) {
    walk(item, map, {
      module: 'Services',
      label: item.title || item.slug || item.id,
      path: `services/${item.slug || item.id}`,
      href: '/admin/services',
    });
  }
  for (const item of sectors) {
    walk(item, map, {
      module: 'Sectors',
      label: item.title || item.slug || item.id,
      path: `sectors/${item.slug || item.id}`,
      href: '/admin/sectors',
    });
  }
  for (const item of blog) {
    walk(item, map, {
      module: 'Blog',
      label: item.title || item.slug || item.id,
      path: `blog/${item.slug || item.id}`,
      href: '/admin/blog',
    });
  }
  for (const item of clients) {
    walk(item, map, {
      module: 'Clients',
      label: item.name || item.title || item.id,
      path: `clients/${item.id}`,
      href: '/admin/clients',
    });
  }
  for (const item of gallery) {
    walk(item, map, {
      module: 'Gallery',
      label: item.title || item.id,
      path: `gallery/${item.id}`,
      href: '/admin/gallery',
    });
  }
  for (const item of downloads) {
    walk(item, map, {
      module: 'Downloads',
      label: item.title || item.id,
      path: `downloads/${item.id}`,
      href: '/admin/downloads',
    });
  }
  for (const item of testimonials) {
    walk(item, map, {
      module: 'Testimonials',
      label: item.name || item.id,
      path: `testimonials/${item.id}`,
      href: '/admin/testimonials',
    });
  }
  for (const member of team) {
    walk(member, map, {
      module: 'Team',
      label: member.full_name || member.name || member.id,
      path: `team/${member.id}`,
      href: `/admin/team/${member.id}`,
    });
  }

  if (seoSettings?.defaultOgImage) {
    pushUsage(map, seoSettings.defaultOgImage, {
      module: 'SEO',
      label: 'Default OG image',
      path: 'seo.defaultOgImage',
      href: '/admin/seo',
    });
  }
  for (const [key, page] of Object.entries(pageSeo?.entries || {})) {
    if (page?.ogImage) {
      pushUsage(map, page.ogImage, {
        module: 'SEO',
        label: page.labelEn || page.path || key,
        path: `page-seo/${key}`,
        href: '/admin/seo',
      });
    }
  }

  // Deduplicate usages per URL
  const byUrl = {};
  for (const [url, usages] of map.entries()) {
    const seen = new Set();
    byUrl[url] = usages.filter((u) => {
      const sig = `${u.module}|${u.label}|${u.path}`;
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
  }

  // Attach to media items for convenience
  const usageByMediaId = {};
  for (const item of media) {
    usageByMediaId[item.id] = byUrl[item.url] || [];
  }

  return {byUrl, usageByMediaId};
}

export async function getMediaUsagesForUrl(url) {
  const {byUrl} = await buildMediaUsageIndex();
  return byUrl[url] || [];
}
