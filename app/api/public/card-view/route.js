import {NextResponse} from 'next/server';
import {normalizeDigitalCard} from '@/lib/cms/corporate/employee-cards';
import {getTeamMemberBySlug, updateTeamMember} from '@/lib/team/store';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const slug = String(body.slug || new URL(request.url).searchParams.get('slug') || '').trim();
    if (!slug) {
      return NextResponse.json({error: 'slug is required'}, {status: 400});
    }

    const member = await getTeamMemberBySlug(slug, {includeDrafts: true});
    if (!member) {
      return NextResponse.json({error: 'Not found'}, {status: 404});
    }

    const card = normalizeDigitalCard(member.digital_card);
    if (!card.enabled || card.status !== 'published') {
      return NextResponse.json({error: 'Card not available'}, {status: 404});
    }

    try {
      await updateTeamMember(member.id, {
        digital_card: {
          ...card,
          views: Number(card.views || 0) + 1,
        },
      });
    } catch {
      // Optional analytics.
    }

    return NextResponse.json({ok: true});
  } catch (error) {
    return NextResponse.json({error: error.message || 'Failed'}, {status: 500});
  }
}
