import {NextResponse} from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'asas-platform',
    time: new Date().toISOString(),
    erp: Boolean(process.env.ASAS_ERP_DB || true),
    mail: Boolean(process.env.RESEND_API_KEY || process.env.STAFF_NOTIFY_EMAIL),
  });
}
