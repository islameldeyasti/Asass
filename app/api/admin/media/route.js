import {mkdir, unlink, writeFile} from 'fs/promises';
import path from 'path';
import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {PERMS} from '@/lib/cms/permissions';
import {addMedia, deleteMedia, listMedia, updateMedia} from '@/lib/cms/content-service';
import {buildMediaUsageIndex, getMediaUsagesForUrl} from '@/lib/cms/media-usage';

export const runtime = 'nodejs';

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'assets', 'asas', 'cms-uploads');
const PUBLIC_PREFIX = '/assets/asas/cms-uploads';

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

function safeFileName(name) {
  const base = String(name || 'file')
    .split(/[/\\]/)
    .pop();
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
  return cleaned || 'file';
}

function matchesQuery(item, q) {
  if (!q) return true;
  const hay = [
    item?.filename,
    item?.url,
    item?.titleEn,
    item?.titleAr,
    item?.altEn,
    item?.altAr,
    item?.mime,
    item?.folder,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(q);
}

function isImageMime(mime) {
  return String(mime || '').startsWith('image/');
}

async function persistUpload(file, session, folder = 'uploads', extra = {}) {
  if (!file || typeof file === 'string' || !file.arrayBuffer) {
    badRequest('File is required (field: file)');
  }
  if (file.size > MAX_BYTES) {
    badRequest('File exceeds 12 MB limit');
  }
  const mime = String(file.type || '').toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    badRequest('Allowed types: JPEG, PNG, WebP, GIF, PDF');
  }

  const originalName = safeFileName(file.name || (isImageMime(mime) ? 'image.jpg' : 'file.pdf'));
  const storedName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${originalName}`;
  await mkdir(UPLOAD_DIR, {recursive: true});
  const abs = path.join(UPLOAD_DIR, storedName);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, bytes);

  return addMedia({
    id: `media-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`,
    url: `${PUBLIC_PREFIX}/${storedName}`,
    filename: originalName,
    mime,
    size: file.size,
    width: null,
    height: null,
    altEn: String(extra.altEn || '').trim(),
    altAr: String(extra.altAr || '').trim(),
    titleEn: String(extra.titleEn || '').trim() || originalName,
    titleAr: String(extra.titleAr || '').trim(),
    folder: String(folder || 'uploads').trim() || 'uploads',
    focalPoint: extra.focalPoint || '50% 50%',
    createdAt: new Date().toISOString(),
    uploadedBy: session.user?.id || session.user?.email || null,
  });
}

export async function GET(request) {
  try {
    await requireAdmin(PERMS.MEDIA_READ);
    const {searchParams} = new URL(request.url);
    const q = String(searchParams.get('q') || '')
      .trim()
      .toLowerCase();
    const usageFilter = String(searchParams.get('usage') || '').trim(); // used | unused | ''
    const includeUsage = searchParams.get('includeUsage') === '1' || Boolean(usageFilter);
    const items = await listMedia();
    let filtered = q ? items.filter((item) => matchesQuery(item, q)) : items;

    let usageByMediaId = {};
    if (includeUsage) {
      const index = await buildMediaUsageIndex();
      usageByMediaId = index.usageByMediaId || {};
      if (usageFilter === 'used') {
        filtered = filtered.filter((item) => (usageByMediaId[item.id] || []).length > 0);
      } else if (usageFilter === 'unused') {
        filtered = filtered.filter((item) => (usageByMediaId[item.id] || []).length === 0);
      }
    }

    const enriched = filtered.map((item) => ({
      ...item,
      usages: usageByMediaId[item.id] || undefined,
      usageCount: usageByMediaId[item.id]?.length ?? undefined,
    }));

    return NextResponse.json({items: enriched});
  } catch (error) {
    return NextResponse.json(
      {error: error.message || 'Failed to list media'},
      {status: error.status || 500},
    );
  }
}

export async function POST(request) {
  try {
    const session = await requireAdmin(PERMS.MEDIA_WRITE);
    const form = await request.formData();
    const folder = String(form.get('folder') || '').trim() || 'uploads';
    const replaceId = String(form.get('replaceId') || '').trim();

    // Replace binary while keeping the same media id + URL references intact when possible
    if (replaceId) {
      const items = await listMedia();
      const existing = items.find((entry) => entry?.id === replaceId);
      if (!existing) {
        const error = new Error('Media not found');
        error.status = 404;
        throw error;
      }
      const file = form.get('file');
      if (!file || typeof file === 'string' || !file.arrayBuffer) {
        badRequest('File is required (field: file)');
      }
      if (file.size > MAX_BYTES) badRequest('File exceeds 12 MB limit');
      const mime = String(file.type || '').toLowerCase();
      if (!ALLOWED_MIME.has(mime)) badRequest('Allowed types: JPEG, PNG, WebP, GIF, PDF');

      const originalName = safeFileName(file.name || existing.filename || 'file');
      let publicUrl = existing.url;
      let abs;
      if (existing.url && String(existing.url).startsWith(PUBLIC_PREFIX)) {
        abs = path.join(process.cwd(), 'public', String(existing.url).replace(/^\//, ''));
      } else {
        const storedName = `${Date.now()}-${originalName}`;
        await mkdir(UPLOAD_DIR, {recursive: true});
        abs = path.join(UPLOAD_DIR, storedName);
        publicUrl = `${PUBLIC_PREFIX}/${storedName}`;
      }
      await mkdir(path.dirname(abs), {recursive: true});
      await writeFile(abs, Buffer.from(await file.arrayBuffer()));

      const item = await updateMedia(replaceId, {
        url: publicUrl,
        filename: originalName,
        mime,
        size: file.size,
        updatedAt: new Date().toISOString(),
        replacedAt: new Date().toISOString(),
        replacedBy: session.user?.id || session.user?.email || null,
      });
      return NextResponse.json({item, replaced: true});
    }

    const files = form.getAll('file').filter((f) => f && typeof f !== 'string' && f.arrayBuffer);
    if (!files.length) badRequest('File is required (field: file)');

    const uploaded = [];
    for (const file of files) {
      // eslint-disable-next-line no-await-in-loop
      const item = await persistUpload(file, session, folder, {
        altEn: form.get('altEn'),
        altAr: form.get('altAr'),
        titleEn: form.get('titleEn'),
        titleAr: form.get('titleAr'),
      });
      uploaded.push(item);
    }

    if (uploaded.length === 1) {
      return NextResponse.json({item: uploaded[0], items: uploaded}, {status: 201});
    }
    return NextResponse.json({items: uploaded}, {status: 201});
  } catch (error) {
    return NextResponse.json(
      {error: error.message || 'Upload failed'},
      {status: error.status || 500},
    );
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin(PERMS.MEDIA_WRITE);
    const body = await request.json();
    const id = body?.id;
    if (!id) badRequest('id is required');

    const patch = {};
    for (const key of ['altEn', 'altAr', 'titleEn', 'titleAr', 'folder', 'focalPoint', 'captionEn', 'captionAr']) {
      if (body[key] !== undefined) patch[key] = body[key];
    }

    const item = await updateMedia(id, patch);
    return NextResponse.json({item});
  } catch (error) {
    return NextResponse.json(
      {error: error.message || 'Update failed'},
      {status: error.status || 500},
    );
  }
}

export async function DELETE(request) {
  try {
    await requireAdmin(PERMS.MEDIA_WRITE);
    const {searchParams} = new URL(request.url);
    const id = searchParams.get('id');
    const force = searchParams.get('force') === '1';
    if (!id) badRequest('id is required');

    const items = await listMedia();
    const existing = items.find((entry) => entry?.id === id);
    if (!existing) {
      const error = new Error('Media not found');
      error.status = 404;
      throw error;
    }

    const usages = await getMediaUsagesForUrl(existing.url);
    if (usages.length > 0 && !force) {
      return NextResponse.json(
        {
          error: `This image is currently used in ${usages.length} place${usages.length === 1 ? '' : 's'}.`,
          code: 'MEDIA_IN_USE',
          usages,
        },
        {status: 409},
      );
    }

    if (existing.url && String(existing.url).startsWith(PUBLIC_PREFIX)) {
      const abs = path.join(process.cwd(), 'public', String(existing.url).replace(/^\//, ''));
      try {
        await unlink(abs);
      } catch {
        // File may already be missing; still remove the record.
      }
    }

    await deleteMedia(id);
    return NextResponse.json({ok: true, forced: force && usages.length > 0});
  } catch (error) {
    return NextResponse.json(
      {error: error.message || 'Delete failed'},
      {status: error.status || 500},
    );
  }
}
