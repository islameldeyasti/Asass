import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {PERMS} from '@/lib/cms/permissions';
import {
  duplicateLetterhead,
  listLetterheads,
  saveLetterhead,
} from '@/lib/cms/corporate/letterheads';

export const runtime = 'nodejs';

function errorResponse(error) {
  const status = error.status || 500;
  return NextResponse.json(
    {error: error.message || 'Request failed'},
    {status},
  );
}

export async function GET() {
  try {
    await requireAdmin(PERMS.LETTERHEADS_READ);
    const items = await listLetterheads();
    const sorted = [...items].sort((a, b) =>
      String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')),
    );
    return NextResponse.json({items: sorted});
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const session = await requireAdmin(PERMS.LETTERHEADS_WRITE);
    const body = await request.json();
    const actor = session.user || {};

    if (body?.duplicateFrom) {
      const item = await duplicateLetterhead(body.duplicateFrom, actor);
      return NextResponse.json({item}, {status: 201});
    }

    const item = await saveLetterhead(body || {}, actor);
    return NextResponse.json({item}, {status: 201});
  } catch (error) {
    return errorResponse(error);
  }
}
