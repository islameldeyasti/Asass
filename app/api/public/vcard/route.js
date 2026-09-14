import {NextResponse} from 'next/server';
import {company} from '@/data/company';
import {
  buildPublicCardPath,
  buildVCard,
  normalizeDigitalCard,
} from '@/lib/cms/corporate/employee-cards';
import {
  getTeamMemberByPublicId,
  getTeamMemberBySlug,
  updateTeamMember,
} from '@/lib/team/store';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const {searchParams} = new URL(request.url);
    const publicId = String(searchParams.get('publicId') || '')
      .trim()
      .toUpperCase();
    const slug = String(searchParams.get('slug') || '').trim();

    let member = null;
    if (publicId) member = await getTeamMemberByPublicId(publicId, {includeDrafts: true});
    else if (slug) member = await getTeamMemberBySlug(slug, {includeDrafts: true});
    else return NextResponse.json({error: 'publicId or slug is required'}, {status: 400});

    if (!member) return NextResponse.json({error: 'Not found'}, {status: 404});

    const card = normalizeDigitalCard(member.digital_card);
    if (!card.enabled || card.status !== 'published') {
      return NextResponse.json({error: 'Card not available'}, {status: 404});
    }

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || company.website;
    const proto =
      request.headers.get('x-forwarded-proto') ||
      (String(host).includes('localhost') ? 'http' : 'https');
    const profileUrl = `${proto}://${host}${buildPublicCardPath(card.publicId)}`;
    const vcard = buildVCard(member, card, company, {profileUrl});
    const filename = `${member.slug || card.publicId || 'contact'}.vcf`;

    try {
      await updateTeamMember(member.id, {
        digital_card: {
          ...card,
          vcardDownloads: Number(card.vcardDownloads || 0) + 1,
        },
      });
    } catch {
      // optional analytics
    }

    return new NextResponse(vcard, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({error: error.message || 'Failed to build vCard'}, {status: 500});
  }
}
