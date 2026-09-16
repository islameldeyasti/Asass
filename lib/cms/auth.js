import {createHmac, randomBytes, timingSafeEqual} from 'crypto';
import {cookies} from 'next/headers';
import {comparePassword} from './password';
import {hasPermission, ROLES} from './permissions';
import {ensureDefaultAdmin, findUserByEmail, getUserById, touchUserLogin} from './users-store';

const COOKIE = 'asas_cms_session';
const LEGACY_COOKIE = 'asas_admin_session';
const MAX_AGE = 60 * 60 * 12;

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'asas-local-admin';
}

function sign(payload) {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

function safeEqual(a, b) {
  try {
    const left = Buffer.from(String(a));
    const right = Buffer.from(String(b));
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export function createSessionToken(user) {
  const issued = Date.now().toString(36);
  const nonce = randomBytes(8).toString('hex');
  const body = `${user.id}.${user.role}.${issued}.${nonce}`;
  return `${body}.${sign(body)}`;
}

export function parseSessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 5) return null;
  const [userId, role, issued, nonce, sig] = parts;
  if (!userId || !role || !issued || !nonce || !sig) return null;
  const body = `${userId}.${role}.${issued}.${nonce}`;
  if (!safeEqual(sig, sign(body))) return null;
  const ts = parseInt(issued, 36);
  if (!Number.isFinite(ts)) return null;
  if (Date.now() - ts >= MAX_AGE * 1000) return null;
  return {userId, role, issuedAt: ts};
}

/** Legacy single-password token (team admin). Used once to bridge upgrades. */
export function isValidLegacyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const [issued, sig] = token.split('.');
  if (!issued || !sig) return false;
  if (!safeEqual(sig, sign(issued))) return false;
  const ts = parseInt(issued, 36);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts < MAX_AGE * 1000;
}

export async function getAdminSession() {
  await ensureDefaultAdmin();
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const parsed = parseSessionToken(token);
  if (parsed) {
    const user = await getUserById(parsed.userId);
    if (!user || !user.active) return null;
    return {
      user: publicUser(user),
      role: user.role,
      permissions: true,
    };
  }

  // Bridge: old shared-password cookie → treat as super admin (read-only session shape)
  const legacy = jar.get(LEGACY_COOKIE)?.value;
  if (isValidLegacyToken(legacy)) {
    const fallback = await findUserByEmail(process.env.ADMIN_EMAIL || 'admin@asasengg.ae');
    if (fallback && fallback.active) {
      return {user: publicUser(fallback), role: fallback.role, legacy: true};
    }
    return {
      user: {
        id: 'legacy-admin',
        email: 'admin@local',
        name: 'Legacy Admin',
        role: ROLES.SUPER_ADMIN,
        active: true,
      },
      role: ROLES.SUPER_ADMIN,
      legacy: true,
    };
  }

  return null;
}

export async function requireAdmin(permission) {
  const session = await getAdminSession();
  if (!session) {
    const error = new Error('Unauthorized');
    error.status = 401;
    throw error;
  }
  if (permission && !hasPermission(session.role, permission)) {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
  return session;
}

export async function authenticateUser(email, password) {
  await ensureDefaultAdmin();
  const user = await findUserByEmail(email);
  if (!user || !user.active) return null;
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return null;
  try {
    await touchUserLogin(user.id);
  } catch {
    // Ignore persistence failures during login.
  }
  return user;
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
    lastLoginAt: user.lastLoginAt || null,
    createdAt: user.createdAt,
  };
}

export function sessionCookieOptions(token) {
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

export function clearSessionCookieOptions() {
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

export function clearLegacyCookieOptions() {
  return {
    name: LEGACY_COOKIE,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  };
}

export {COOKIE as CMS_COOKIE, LEGACY_COOKIE};
