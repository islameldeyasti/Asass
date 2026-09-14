import {NextResponse} from 'next/server';
import {normalizeDigitalCard} from '@/lib/cms/corporate/employee-cards';
import {getTeamMemberByPublicId, updateTeamMember} from '@/lib/team/store';

export const runtime = 'nodejs';

const COUNTERS = {
  view: 'views',
  vcard: 'vcardDownloads',
  call: 'callClicks',
  email: 'emailClicks',
  whatsapp: 'whatsappClicks',
  share: 'shareClicks',
  contact: 'contactClicks',
};

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const publicId = String(body.publicId || '')
      .trim()
      .toUpperCase();
    const type = String(body.type || 'view').toLowerCase();
    if (!publicId) return NextResponse.json({error: 'publicId required'}, {status: 400});

    const member = await getTeamMemberByPublicId(publicId, {includeDrafts: true});
    if (!member) return NextResponse.json({ok: true});

    const card = normalizeDigitalCard(member.digital_card);
    if (!(card.enabled && card.status === 'published') && type === 'view') {
      return NextResponse.json({ok: true});
    }

    const key = COUNTERS[type] || 'contactClicks';
    try {
      await updateTeamMember(member.id, {
        digital_card: {
          ...card,
          [key]: Number(card[key] || 0) + 1,
        },
      });
    } catch {
      // ignore read-only FS
    }

    return NextResponse.json({ok: true});
  } catch (error) {
    return NextResponse.json({ok: true});
  }
}
