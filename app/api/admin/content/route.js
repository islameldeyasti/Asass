import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {writeAudit} from '@/lib/cms/audit';
import {PERMS} from '@/lib/cms/permissions';
import {deleteCollectionItem, upsertCollectionItem} from '@/lib/cms/json-store';
import {
  addMedia,
  deleteBlogPost,
  deleteMedia,
  deleteProject,
  getBlogPosts,
  getClients,
  getDownloads,
  getFooter,
  getGalleryItems,
  getHomepage,
  getJobs,
  getNavigation,
  getPageCopy,
  getProjects,
  getRedirects,
  getSectors,
  getServices,
  getSettings,
  getTestimonials,
  getVideos,
  listApplications,
  listContacts,
  listEnquiries,
  listMedia,
  saveBlogPost,
  saveClient,
  saveDownload,
  saveJob,
  savePageCopy,
  saveProject,
  saveRedirects,
  saveSector,
  saveService,
  saveTestimonial,
  saveVideo,
  deleteVideo,
  updateApplication,
  updateEnquiry,
  updateFooter,
  updateHomepage,
  updateNavigation,
  updateSettings,
} from '@/lib/cms/content-service';

export const runtime = 'nodejs';

function errorResponse(error) {
  const status = error.status || 500;
  return NextResponse.json({error: error.message || 'Request failed'}, {status});
}

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

const RESOURCES = {
  'blog-posts': {
    kind: 'collection',
    read: PERMS.BLOG_READ,
    write: PERMS.BLOG_WRITE,
    list: getBlogPosts,
    save: saveBlogPost,
    remove: async ({id, slug}) => deleteBlogPost(slug || id),
  },
  projects: {
    kind: 'collection',
    read: PERMS.PROJECTS_READ,
    write: PERMS.PROJECTS_WRITE,
    list: getProjects,
    save: saveProject,
    remove: async ({id, slug}) => deleteProject(slug || id),
  },
  services: {
    kind: 'collection',
    read: PERMS.SERVICES_READ,
    write: PERMS.SERVICES_WRITE,
    list: getServices,
    save: saveService,
    remove: async ({id, slug}) => {
      await getServices();
      return deleteCollectionItem('services', slug || id, slug ? 'slug' : 'id');
    },
  },
  sectors: {
    kind: 'collection',
    read: PERMS.SECTORS_READ,
    write: PERMS.SECTORS_WRITE,
    list: getSectors,
    save: saveSector,
    remove: async ({id, slug}) => {
      await getSectors();
      return deleteCollectionItem('sectors', slug || id, slug ? 'slug' : 'id');
    },
  },
  clients: {
    kind: 'collection',
    read: PERMS.CLIENTS_READ,
    write: PERMS.CLIENTS_WRITE,
    list: getClients,
    save: saveClient,
    remove: async ({id}) => {
      await getClients();
      return deleteCollectionItem('clients', id, 'id');
    },
  },
  testimonials: {
    kind: 'collection',
    read: PERMS.TESTIMONIALS_READ,
    write: PERMS.TESTIMONIALS_WRITE,
    list: getTestimonials,
    save: saveTestimonial,
    remove: async ({id}) => {
      await getTestimonials();
      return deleteCollectionItem('testimonials', id, 'id');
    },
  },
  gallery: {
    kind: 'collection',
    read: PERMS.GALLERY_READ,
    write: PERMS.GALLERY_WRITE,
    list: getGalleryItems,
    save: async (item) => {
      await getGalleryItems();
      if (!item?.id) badRequest('Gallery item id is required');
      return upsertCollectionItem('gallery', {...item, updatedAt: new Date().toISOString()}, 'id');
    },
    remove: async ({id}) => {
      await getGalleryItems();
      return deleteCollectionItem('gallery', id, 'id');
    },
  },
  videos: {
    kind: 'collection',
    read: PERMS.VIDEOS_READ,
    write: PERMS.VIDEOS_WRITE,
    list: getVideos,
    save: saveVideo,
    remove: async ({id}) => deleteVideo(id),
  },
  jobs: {
    kind: 'collection',
    read: PERMS.CAREERS_READ,
    write: PERMS.CAREERS_WRITE,
    list: getJobs,
    save: saveJob,
    remove: async ({id, slug}) => {
      await getJobs();
      return deleteCollectionItem('jobs', slug || id, slug ? 'slug' : 'id');
    },
  },
  downloads: {
    kind: 'collection',
    read: PERMS.DOWNLOADS_READ,
    write: PERMS.DOWNLOADS_WRITE,
    list: getDownloads,
    save: saveDownload,
    remove: async ({id}) => {
      await getDownloads();
      return deleteCollectionItem('downloads', id, 'id');
    },
  },
  media: {
    kind: 'collection',
    read: PERMS.MEDIA_READ,
    write: PERMS.MEDIA_WRITE,
    list: listMedia,
    save: addMedia,
    remove: async ({id}) => deleteMedia(id),
  },
  enquiries: {
    kind: 'collection',
    read: PERMS.ENQUIRIES_READ,
    write: PERMS.ENQUIRIES_WRITE,
    list: listEnquiries,
    save: async (item) => {
      if (!item?.id) badRequest('Enquiry id is required');
      const {id, ...patch} = item;
      return updateEnquiry(id, patch);
    },
    remove: null,
  },
  contacts: {
    kind: 'collection',
    read: PERMS.ENQUIRIES_READ,
    write: PERMS.ENQUIRIES_WRITE,
    list: listContacts,
    save: null,
    remove: null,
  },
  applications: {
    kind: 'collection',
    read: PERMS.APPLICATIONS_READ,
    write: PERMS.CAREERS_WRITE,
    list: listApplications,
    save: async (item) => {
      if (!item?.id) badRequest('Application id is required');
      const {id, ...patch} = item;
      return updateApplication(id, patch);
    },
    remove: null,
  },
  settings: {
    kind: 'document',
    read: PERMS.SETTINGS_READ,
    write: PERMS.SETTINGS_WRITE,
    get: getSettings,
    save: updateSettings,
  },
  homepage: {
    kind: 'document',
    read: PERMS.HOMEPAGE_READ,
    write: PERMS.HOMEPAGE_WRITE,
    get: getHomepage,
    save: updateHomepage,
  },
  navigation: {
    kind: 'document',
    read: PERMS.NAVIGATION_READ,
    write: PERMS.NAVIGATION_WRITE,
    get: getNavigation,
    save: updateNavigation,
  },
  footer: {
    kind: 'document',
    read: PERMS.NAVIGATION_READ,
    write: PERMS.NAVIGATION_WRITE,
    get: getFooter,
    save: updateFooter,
  },
  'page-copy': {
    kind: 'page-copy',
    read: PERMS.PAGES_READ,
    write: PERMS.PAGES_WRITE,
  },
  redirects: {
    kind: 'document',
    read: PERMS.REDIRECTS_READ,
    write: PERMS.REDIRECTS_WRITE,
    get: getRedirects,
    save: saveRedirects,
  },
};

function resolveResource(name) {
  const resource = RESOURCES[name];
  if (!resource) badRequest(`Unknown resource: ${name || '(empty)'}`);
  return resource;
}

export async function GET(request) {
  try {
    const {searchParams} = new URL(request.url);
    const name = searchParams.get('resource');
    const resource = resolveResource(name);
    await requireAdmin(resource.read);

    if (resource.kind === 'collection') {
      const items = await resource.list();
      return NextResponse.json({resource: name, items});
    }

    if (resource.kind === 'page-copy') {
      const pageId = searchParams.get('pageId') || undefined;
      const document = await getPageCopy(pageId);
      return NextResponse.json({resource: name, document, pageId: pageId || null});
    }

    const document = await resource.get();
    return NextResponse.json({resource: name, document});
  } catch (error) {
    return errorResponse(error);
  }
}

async function writeHandler(request, method) {
  try {
    const body = await request.json();
    const name = body?.resource;
    const resource = resolveResource(name);
    const session = await requireAdmin(resource.write);

    let result;

    if (resource.kind === 'collection') {
      if (!resource.save) badRequest(`${name} is read-only`);
      const item = body.item;
      if (!item || typeof item !== 'object') badRequest('item is required');
      result = await resource.save(item);
      await writeAudit({
        actorId: session.user.id,
        actorEmail: session.user.email,
        action: `content.${name}.${method === 'POST' ? 'create' : 'update'}`,
        entity: name,
        entityId: result?.id || result?.slug || 'item',
      });
      return NextResponse.json({resource: name, item: result});
    }

    if (resource.kind === 'page-copy') {
      const pageId = body.pageId || body.document?.pageId;
      if (!pageId) badRequest('pageId is required');
      const document = body.document || body.item || {};
      result = await savePageCopy(pageId, document);
      await writeAudit({
        actorId: session.user.id,
        actorEmail: session.user.email,
        action: 'content.page-copy.update',
        entity: 'page-copy',
        entityId: pageId,
      });
      return NextResponse.json({resource: name, document: result, pageId});
    }

    const document = body.document ?? body.item;
    if (!document || typeof document !== 'object') badRequest('document is required');
    result = await resource.save(document);
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: `content.${name}.update`,
      entity: name,
      entityId: name,
    });
    return NextResponse.json({resource: name, document: result});
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  return writeHandler(request, 'POST');
}

export async function PUT(request) {
  return writeHandler(request, 'PUT');
}

export async function PATCH(request) {
  return writeHandler(request, 'PATCH');
}

export async function DELETE(request) {
  try {
    const {searchParams} = new URL(request.url);
    const name = searchParams.get('resource');
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const resource = resolveResource(name);
    const session = await requireAdmin(resource.write);

    if (resource.kind !== 'collection') {
      badRequest('Only collection resources support DELETE');
    }
    if (!resource.remove) badRequest(`${name} does not support delete`);
    if (!id && !slug) badRequest('id or slug is required');

    await resource.remove({id, slug});
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: `content.${name}.delete`,
      entity: name,
      entityId: slug || id,
    });
    return NextResponse.json({ok: true, resource: name});
  } catch (error) {
    return errorResponse(error);
  }
}
