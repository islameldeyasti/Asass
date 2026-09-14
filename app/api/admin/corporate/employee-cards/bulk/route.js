import {NextResponse} from 'next/server';
import JSZip from 'jszip';
import {requireAdmin} from '@/lib/cms/auth';
import {writeAudit} from '@/lib/cms/audit';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {
  DEFAULT_CARD_TEMPLATE,
  buildPublicCardPath,
  normalizeDigitalCard,
} from '@/lib/cms/corporate/employee-cards';
import {generateQrPngBuffer, generateQrSvgString} from '@/lib/cms/corporate/qr';
import {company} from '@/data/company';
import {
  allocateCardPublicId,
  getTeamMemberById,
  listTeamMembers,
  updateTeamMember,
} from '@/lib/team/store';

export const runtime = 'nodejs';

function originFrom(request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || company.website;
  const proto =
    request.headers.get('x-forwarded-proto') ||
    (String(host).includes('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function POST(request) {
  try {
    const session = await requireAdmin();
    const canWrite =
      hasPermission(session.role, PERMS.EMPLOYEE_CARDS_WRITE) ||
      hasPermission(session.role, PERMS.TEAM_WRITE);
    if (!canWrite) return NextResponse.json({error: 'Forbidden'}, {status: 403});

    const body = await request.json();
    const action = String(body.action || '').trim();
    const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];

    if (action === 'bulk-create') {
      const templateId = body.templateId || DEFAULT_CARD_TEMPLATE;
      const updated = [];
      for (const id of ids) {
        // eslint-disable-next-line no-await-in-loop
        const member = await getTeamMemberById(id);
        if (!member) continue;
        const existing = normalizeDigitalCard(member.digital_card);
        if (existing.enabled || existing.status === 'published') {
          updated.push(member);
          continue;
        }
        const publicId = existing.publicId || (await allocateCardPublicId());
        const card = normalizeDigitalCard({
          ...existing,
          publicId,
          templateId,
          enabled: false,
          status: 'draft',
        });
        // eslint-disable-next-line no-await-in-loop
        const next = await updateTeamMember(id, {digital_card: card});
        updated.push(next);
      }
      await writeAudit({
        actorId: session.user?.id,
        actorEmail: session.user?.email,
        action: 'employee_card.bulk_create',
        entity: 'employee_card',
        entityId: 'bulk',
        meta: {count: updated.length, templateId},
      });
      return NextResponse.json({ok: true, members: updated});
    }

    if (action === 'bulk-qr-zip') {
      const format = body.format === 'svg' ? 'svg' : 'png';
      const zip = new JSZip();
      const origin = originFrom(request);
      const members = ids.length
        ? await Promise.all(ids.map((id) => getTeamMemberById(id)))
        : await listTeamMembers({includeDrafts: true});

      for (const member of members.filter(Boolean)) {
        const card = normalizeDigitalCard(member.digital_card);
        if (!card.publicId) continue;
        const url = `${origin}${buildPublicCardPath(card.publicId)}`;
        const base = `${member.slug || card.publicId}-qr`;
        if (format === 'svg') {
          // eslint-disable-next-line no-await-in-loop
          const svg = await generateQrSvgString(url, {errorCorrectionLevel: 'Q', width: 1024, margin: 2});
          zip.file(`${base}.svg`, svg);
        } else {
          // eslint-disable-next-line no-await-in-loop
          const buf = await generateQrPngBuffer(url, {errorCorrectionLevel: 'Q', width: 1024, margin: 2});
          zip.file(`${base}.png`, buf);
        }
      }

      const content = await zip.generateAsync({type: 'uint8array'});
      await writeAudit({
        actorId: session.user?.id,
        actorEmail: session.user?.email,
        action: 'employee_card.bulk_qr_export',
        entity: 'employee_card',
        entityId: 'bulk',
        meta: {count: ids.length || members.length, format},
      });
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="asas-employee-qr-${format}.zip"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json({error: 'Unknown action'}, {status: 400});
  } catch (error) {
    return NextResponse.json({error: error.message || 'Request failed'}, {status: error.status || 500});
  }
}
