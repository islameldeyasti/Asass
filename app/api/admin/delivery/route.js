import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {PERMS} from '@/lib/cms/permissions';
import {buildDeliveryBackup} from '@/lib/admin/backup';
import {syncIdentities} from '@/lib/ops/identity-sync';
import {sendMail} from '@/lib/cms/mail';
import {database} from '@/lib/erp/database';
import {vatSummary} from '@/lib/erp/compliance';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await requireAdmin(PERMS.SETTINGS_READ);
    const action = new URL(request.url).searchParams.get('action') || 'status';
    if (action === 'backup') {
      await requireAdmin(PERMS.SETTINGS_WRITE);
      const {bytes, filename} = await buildDeliveryBackup();
      return new Response(bytes, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }
    if (action === 'vat') {
      return NextResponse.json(vatSummary());
    }
    const db = database();
    const records = db.prepare('SELECT COUNT(*) n FROM records').get()?.n || 0;
    return NextResponse.json({
      ok: true,
      records,
      mailQueued: true,
      time: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({error: error.message || 'Forbidden'}, {status: error.status || 500});
  }
}

export async function POST(request) {
  try {
    const session = await requireAdmin(PERMS.SETTINGS_WRITE);
    const body = await request.json().catch(() => ({}));
    if (body.action === 'sync') {
      return NextResponse.json({ok: true, result: await syncIdentities()});
    }
    if (body.action === 'mail-test') {
      const result = await sendMail({
        to: body.to || session.user.email,
        subject: 'ASAS delivery mail test',
        text: 'Mail queue is working. Configure RESEND_API_KEY to send live email.',
      });
      return NextResponse.json(result);
    }
    return NextResponse.json({error: 'Unknown action'}, {status: 400});
  } catch (error) {
    return NextResponse.json({error: error.message || 'Forbidden'}, {status: error.status || 500});
  }
}
