import {NextResponse} from 'next/server';
import {
  buildPublicCardPath,
  normalizeDigitalCard,
} from '@/lib/cms/corporate/employee-cards';
import {generateQrPngBuffer, generateQrSvgString} from '@/lib/cms/corporate/qr';
import {company} from '@/data/company';
import {getTeamMemberByPublicId, getTeamMemberBySlug} from '@/lib/team/store';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const {searchParams} = new URL(request.url);
    const publicId = String(searchParams.get('publicId') || '')
      .trim()
      .toUpperCase();
    const slug = String(searchParams.get('slug') || '').trim();
    const format = String(searchParams.get('format') || 'png').toLowerCase();
    const size = Math.min(2048, Math.max(256, Number(searchParams.get('size')) || 1024));

    let member = null;
    if (publicId) member = await getTeamMemberByPublicId(publicId, {includeDrafts: true});
    else if (slug) member = await getTeamMemberBySlug(slug, {includeDrafts: true});
    else return NextResponse.json({error: 'publicId or slug is required'}, {status: 400});

    if (!member) return NextResponse.json({error: 'Not found'}, {status: 404});
    const card = normalizeDigitalCard(member.digital_card);
    if (!card.publicId) {
      return NextResponse.json({error: 'Card has no public ID yet'}, {status: 400});
    }

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || company.website;
    const proto =
      request.headers.get('x-forwarded-proto') ||
      (String(host).includes('localhost') ? 'http' : 'https');
    const url = `${proto}://${host}${buildPublicCardPath(card.publicId)}`;

    const opts = {errorCorrectionLevel: 'Q', margin: 2, width: size};
    const baseName = `${member.slug || card.publicId}-qr`;

    if (format === 'svg') {
      const svg = await generateQrSvgString(url, opts);
      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="${baseName}.svg"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const buffer = await generateQrPngBuffer(url, opts);
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${baseName}.png"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({error: error.message || 'QR failed'}, {status: 500});
  }
}
