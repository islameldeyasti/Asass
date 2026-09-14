import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {writeAudit} from '@/lib/cms/audit';
import {PERMS} from '@/lib/cms/permissions';
import {getSeoSettings, updateSeoSettings} from '@/lib/cms/seo-store';

export const runtime = 'nodejs';

function errorResponse(error) {
  const status = error.status || 500;
  return NextResponse.json({error: error.message || 'Request failed'}, {status});
}

export async function GET() {
  try {
    await requireAdmin(PERMS.SEO_READ);
    const settings = await getSeoSettings();
    return NextResponse.json({settings});
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request) {
  try {
    const session = await requireAdmin(PERMS.SEO_WRITE);
    const body = await request.json();
    const settings = await updateSeoSettings(body || {});
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'seo.update',
      entity: 'seo',
      entityId: 'global',
    });
    return NextResponse.json({settings});
  } catch (error) {
    return errorResponse(error);
  }
}
