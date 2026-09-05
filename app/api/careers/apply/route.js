import {mkdir, writeFile} from 'fs/promises';
import path from 'path';
import {NextResponse} from 'next/server';
import {GENERAL_APPLICATION, getJobBySlug, getOpenJobs} from '@/data/careers';
import {company} from '@/data/company';

export const runtime = 'nodejs';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXT = ['.pdf', '.doc', '.docx'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeName(name) {
  return String(name || 'file')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function validatePosition(position) {
  if (position === GENERAL_APPLICATION.slug) return true;
  const job = getJobBySlug(position);
  return Boolean(job && job.status === 'open');
}

export async function POST(request) {
  try {
    const form = await request.formData();
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const phone = String(form.get('phone') || '').trim();
    const position = String(form.get('position') || '').trim();
    const positionLabel = String(form.get('positionLabel') || '').trim();
    const portfolio = String(form.get('portfolio') || '').trim();
    const message = String(form.get('message') || '').trim();
    const consent = String(form.get('consent') || '') === 'yes';
    const locale = String(form.get('locale') || 'en');
    const cv = form.get('cv');

    if (!name || !email || !phone || !position || !consent) {
      return NextResponse.json({error: 'Missing required fields'}, {status: 400});
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({error: 'Invalid email'}, {status: 400});
    }
    if (!validatePosition(position)) {
      return NextResponse.json({error: 'Invalid position'}, {status: 400});
    }
    if (!cv || typeof cv === 'string' || !cv.arrayBuffer) {
      return NextResponse.json({error: 'CV file is required'}, {status: 400});
    }
    if (cv.size > MAX_BYTES) {
      return NextResponse.json({error: 'CV exceeds 5 MB'}, {status: 400});
    }

    const original = safeName(cv.name || 'cv.pdf');
    const lower = original.toLowerCase();
    if (!ALLOWED_EXT.some((ext) => lower.endsWith(ext))) {
      return NextResponse.json({error: 'Invalid CV file type'}, {status: 400});
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const id = `${stamp}-${safeName(name)}`;
    const root = path.join(process.cwd(), '.data', 'applications', id);
    await mkdir(root, {recursive: true});

    const bytes = Buffer.from(await cv.arrayBuffer());
    const cvPath = path.join(root, original);
    await writeFile(cvPath, bytes);

    const record = {
      id,
      receivedAt: new Date().toISOString(),
      recipient: company.email,
      locale,
      applicant: {name, email, phone, portfolio, message, consent: true},
      position: {
        slug: position,
        label: positionLabel || position,
        openRolesSnapshot: getOpenJobs().map((job) => job.slug),
      },
      cv: {
        fileName: original,
        size: cv.size,
        type: cv.type || null,
        storedAt: cvPath,
      },
      routingNote:
        'Application captured for ASAS hiring review. Connect SMTP/ATS later to auto-forward to HR.',
    };

    await writeFile(path.join(root, 'application.json'), JSON.stringify(record, null, 2));

    // Optional webhook / email bridge when configured.
    const webhook = process.env.CAREERS_WEBHOOK_URL;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            to: company.email,
            subject: `Career application — ${positionLabel || position}`,
            record: {
              ...record,
              cv: {...record.cv, storedAt: undefined},
            },
          }),
        });
      } catch {
        // Storage succeeded; webhook failure should not fail the applicant UX.
      }
    }

    return NextResponse.json({
      ok: true,
      id,
      message: 'Application received',
    });
  } catch (error) {
    console.error('careers apply error', error);
    return NextResponse.json({error: 'Server error'}, {status: 500});
  }
}
