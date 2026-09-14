import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {PERMS} from '@/lib/cms/permissions';
import {
  deleteLetterhead,
  getLetterhead,
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

export async function GET(_request, {params}) {
  try {
    await requireAdmin(PERMS.LETTERHEADS_READ);
    const {id} = await params;
    const item = await getLetterhead(id);
    if (!item) {
      return NextResponse.json({error: 'Not found'}, {status: 404});
    }
    return NextResponse.json({item});
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request, {params}) {
  try {
    const session = await requireAdmin(PERMS.LETTERHEADS_WRITE);
    const {id} = await params;
    const existing = await getLetterhead(id);
    if (!existing) {
      return NextResponse.json({error: 'Not found'}, {status: 404});
    }
    const body = await request.json();
    const item = await saveLetterhead({...body, id}, session.user || {});
    return NextResponse.json({item});
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request, {params}) {
  try {
    const session = await requireAdmin(PERMS.LETTERHEADS_WRITE);
    const {id} = await params;
    const existing = await getLetterhead(id);
    if (!existing) {
      return NextResponse.json({error: 'Not found'}, {status: 404});
    }
    await deleteLetterhead(id, session.user || {});
    return NextResponse.json({ok: true});
  } catch (error) {
    return errorResponse(error);
  }
}
