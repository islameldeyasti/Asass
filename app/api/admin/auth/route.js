import {NextResponse} from 'next/server';
import {
  authenticateUser,
  clearLegacyCookieOptions,
  clearSessionCookieOptions,
  createSessionToken,
  getAdminSession,
  publicUser,
  sessionCookieOptions,
} from '@/lib/cms/auth';
import {writeAudit} from '@/lib/cms/audit';
import {permissionsForRole} from '@/lib/cms/permissions';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({authenticated: false});
  }
  return NextResponse.json({
    authenticated: true,
    user: session.user,
    role: session.role,
    permissions: permissionsForRole(session.role),
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim();
    const password = String(body?.password || '');

    // Support legacy password-only login during migration
    const user = email
      ? await authenticateUser(email, password)
      : await authenticateUser(process.env.ADMIN_EMAIL || 'admin@asasengg.ae', password);

    if (!user) {
      return NextResponse.json({error: 'Invalid email or password'}, {status: 401});
    }

    const token = createSessionToken(user);
    await writeAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: 'auth.login',
      entity: 'user',
      entityId: user.id,
    });

    const response = NextResponse.json({ok: true, user: publicUser(user)});
    response.cookies.set(sessionCookieOptions(token));
    response.cookies.set(clearLegacyCookieOptions());
    return response;
  } catch {
    return NextResponse.json({error: 'Unable to sign in'}, {status: 400});
  }
}

export async function DELETE() {
  const session = await getAdminSession();
  if (session?.user) {
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'auth.logout',
      entity: 'user',
      entityId: session.user.id,
    });
  }
  const response = NextResponse.json({ok: true});
  response.cookies.set(clearSessionCookieOptions());
  response.cookies.set(clearLegacyCookieOptions());
  return response;
}
