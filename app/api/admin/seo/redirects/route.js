import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {writeAudit} from '@/lib/cms/audit';
import {PERMS} from '@/lib/cms/permissions';
import {getRedirects, saveRedirects} from '@/lib/cms/content-service';

export const runtime = 'nodejs';

function errorResponse(error) {
  const status = error.status || 500;
  return NextResponse.json({error: error.message || 'Request failed'}, {status});
}

export async function GET() {
  try {
    await requireAdmin(PERMS.REDIRECTS_READ);
    const document = await getRedirects();
    return NextResponse.json({
      document,
      items: Array.isArray(document?.items) ? document.items : [],
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request) {
  try {
    const session = await requireAdmin(PERMS.REDIRECTS_WRITE);
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : body?.document?.items;
    const document = await saveRedirects({
      ...(body?.document || {}),
      items: Array.isArray(items) ? items : [],
    });
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'seo.redirects.update',
      entity: 'redirects',
      entityId: 'global',
    });
    return NextResponse.json({
      document,
      items: Array.isArray(document?.items) ? document.items : [],
    });
  } catch (error) {
    return errorResponse(error);
  }
}
