import {appendFile, mkdir} from 'fs/promises';
import path from 'path';

function mailDir() {
  return path.join(process.cwd(), '.data', 'mail');
}

export async function sendMail({to, subject, text, html}) {
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!recipients.length) return {ok: false, reason: 'no-recipient'};
  const payload = {
    at: new Date().toISOString(),
    to: recipients,
    subject: String(subject || ''),
    text: String(text || ''),
    html: html || null,
  };
  await mkdir(mailDir(), {recursive: true});
  await appendFile(path.join(mailDir(), 'queue.jsonl'), `${JSON.stringify(payload)}\n`, 'utf8');

  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'ASAS Engineering <noreply@asasengg.ae>';
  if (key) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {Authorization: `Bearer ${key}`, 'Content-Type': 'application/json'},
        body: JSON.stringify({from, to: recipients, subject: payload.subject, text: payload.text, html: payload.html || undefined}),
      });
      if (!res.ok) throw new Error(await res.text());
      return {ok: true, sent: true, queued: true};
    } catch (error) {
      console.error('[mail] resend failed', error.message);
      return {ok: true, sent: false, queued: true, reason: error.message};
    }
  }
  return {ok: true, sent: false, queued: true};
}

export async function notifyStaff(subject, text) {
  const to = process.env.STAFF_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;
  return sendMail({to, subject, text});
}
