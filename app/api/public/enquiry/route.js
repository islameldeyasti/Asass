import {NextResponse} from 'next/server';
import {addEnquiry} from '@/lib/cms/content-service';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const service = String(body.service || '').trim();
    const serviceLabel = String(body.serviceLabel || '').trim();
    const location = String(body.location || '').trim();
    const message = String(body.message || '').trim();
    const locale = String(body.locale || 'en');
    const source = String(body.source || 'enquiry-form');

    if (!name || !email || !message) {
      return NextResponse.json({error: 'Missing required fields'}, {status: 400});
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({error: 'Invalid email'}, {status: 400});
    }

    const record = await addEnquiry({
      name,
      email,
      phone,
      service,
      serviceLabel,
      location,
      message,
      locale,
      source,
      status: 'new',
    });

    return NextResponse.json({ok: true, id: record.id});
  } catch (error) {
    console.error('public enquiry error', error);
    return NextResponse.json({error: 'Server error'}, {status: 500});
  }
}
