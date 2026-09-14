import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {writeAudit} from '@/lib/cms/audit';
import {PERMS} from '@/lib/cms/permissions';
import {
  ensurePageSeoSeeded,
  getAllPageSeo,
  upsertPageSeo,
} from '@/lib/cms/seo/page-seo-store';
import {listSeoTargets} from '@/lib/cms/seo/registry';

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

export async function GET() {
  try {
    await requireAdmin(PERMS.SEO_READ);
    await ensurePageSeoSeeded();
    const [store, targets] = await Promise.all([getAllPageSeo(), listSeoTargets()]);
    return NextResponse.json({
      entries: store.entries || {},
      targets,
      updatedAt: store.updatedAt || null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request) {
  try {
    const session = await requireAdmin(PERMS.SEO_WRITE);
    const body = await request.json();
    const key = body?.key;
    if (!key) badRequest('key is required');

    const {key: _ignored, ...fields} = body;
    const entry = await upsertPageSeo(key, fields);
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'seo.page.upsert',
      entity: 'page-seo',
      entityId: key,
    });
    return NextResponse.json({entry});
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const session = await requireAdmin(PERMS.SEO_WRITE);
    const body = await request.json();
    const entries = Array.isArray(body?.entries) ? body.entries : null;
    if (!entries) badRequest('entries array is required');

    const saved = [];
    for (const item of entries) {
      if (!item?.key) continue;
      const {key, ...fields} = item;
      saved.push(await upsertPageSeo(key, fields));
    }

    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'seo.page.bulk',
      entity: 'page-seo',
      entityId: `bulk:${saved.length}`,
    });

    return NextResponse.json({entries: saved, count: saved.length});
  } catch (error) {
    return errorResponse(error);
  }
}
