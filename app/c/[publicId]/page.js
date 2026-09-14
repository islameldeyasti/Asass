import {notFound} from 'next/navigation';
import Link from 'next/link';
import {headers} from 'next/headers';
import {company} from '@/data/company';
import {
  buildPublicCardPath,
  normalizeDigitalCard,
} from '@/lib/cms/corporate/employee-cards';
import {generateQrDataUrl} from '@/lib/cms/corporate/qr';
import {getBranding} from '@/lib/cms/branding-server';
import {getTeamMemberByPublicId} from '@/lib/team/store';
import DigitalCardProfile from '@/components/corporate/cards/DigitalCardProfile';
import '@/app/fonts-arabic.css';
import '@/app/corporate-cards.css';

export const dynamic = 'force-dynamic';

function absUrl(path, host, proto) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${proto}://${host}${path.startsWith('/') ? path : `/${path}`}`;
}

async function requestOrigin() {
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host') || company.website;
    const proto =
      h.get('x-forwarded-proto') || (String(host).includes('localhost') ? 'http' : 'https');
    return {host, proto};
  } catch {
    return {host: company.website, proto: 'https'};
  }
}

export async function generateMetadata({params, searchParams}) {
  const {publicId} = await params;
  const sp = await searchParams;
  const locale = sp?.lang === 'ar' ? 'ar' : 'en';
  const member = await getTeamMemberByPublicId(publicId, {includeDrafts: true});
  const card = normalizeDigitalCard(member?.digital_card);
  const ar = locale === 'ar';
  const name = ar ? member?.name_ar || member?.name_en : member?.name_en;
  const titleJob = ar ? member?.job_title_ar || member?.job_title_en : member?.job_title_en;
  const title = name
    ? `${name}${titleJob ? ` — ${titleJob}` : ''} | ASAS`
    : 'ASAS Digital Card';
  const {host, proto} = await requestOrigin();
  const ogImage = member?.profile_image
    ? absUrl(member.profile_image, host, proto)
    : undefined;

  const published = member && card.enabled && card.status === 'published';

  return {
    title,
    description: titleJob
      ? `${name} · ${titleJob} — ASAS Engineering & Project Management Consultancy`
      : undefined,
    robots: {
      index: false,
      follow: false,
      googleBot: {index: false, follow: false},
    },
    openGraph: published
      ? {
          title,
          images: ogImage ? [{url: ogImage}] : undefined,
        }
      : {title: 'ASAS Digital Card'},
  };
}

export default async function StableDigitalCardPage({params, searchParams}) {
  const {publicId} = await params;
  const sp = await searchParams;
  const locale = sp?.lang === 'ar' ? 'ar' : 'en';
  const member = await getTeamMemberByPublicId(publicId, {includeDrafts: true});
  if (!member) notFound();

  const card = normalizeDigitalCard(member.digital_card);
  const branding = await getBranding();
  const {host, proto} = await requestOrigin();
  const profileUrl = `${proto}://${host}${buildPublicCardPath(card.publicId || publicId)}`;
  const qrDataUrl = await generateQrDataUrl(profileUrl, {
    errorCorrectionLevel: 'Q',
    width: 640,
    margin: 2,
  });

  const unavailable = !(card.enabled && card.status === 'published');

  return (
    <main className="dcard-page" data-theme-lock="employee-card">
      <div className="dcard-page-inner">
        <div className="dcard-lang no-print">
          <Link href={`/c/${encodeURIComponent(publicId)}?lang=en`} hrefLang="en">
            EN
          </Link>
          <Link href={`/c/${encodeURIComponent(publicId)}?lang=ar`} hrefLang="ar">
            العربية
          </Link>
        </div>
        <DigitalCardProfile
          member={member}
          card={card}
          company={company}
          locale={locale}
          qrDataUrl={qrDataUrl}
          branding={branding}
          profileUrl={profileUrl}
          trackViews={!unavailable}
          unavailable={unavailable}
        />
      </div>
    </main>
  );
}
