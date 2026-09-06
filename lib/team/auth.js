import {createHmac, timingSafeEqual} from 'crypto';
import {cookies} from 'next/headers';

const COOKIE = 'asas_admin_session';
const MAX_AGE = 60 * 60 * 12;

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'asas-local-admin';
}

function password() {
  return process.env.ADMIN_PASSWORD || 'asas-admin';
}

function sign(payload) {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

export function verifyAdminPassword(input) {
  return String(input || '') === password();
}

export function createAdminToken() {
  const issued = Date.now().toString(36);
  const sig = sign(issued);
  return `${issued}.${sig}`;
}

export function isValidAdminToken(token) {
  if (!token || typeof token !== 'string') return false;
  const [issued, sig] = token.split('.');
  if (!issued || !sig) return false;
  const expected = sign(issued);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const ts = parseInt(issued, 36);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < MAX_AGE * 1000;
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  return isValidAdminToken(token);
}

export function adminCookieOptions(token) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  };
}

export function clearAdminCookieOptions() {
  return {
    name: COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  };
}

export {COOKIE as ADMIN_COOKIE};
