import {NextResponse} from 'next/server';
import {
  adminCookieOptions,
  clearAdminCookieOptions,
  createAdminToken,
  getAdminSession,
  verifyAdminPassword,
} from '@/lib/team/auth';

export const runtime = 'nodejs';

export async function GET() {
  const ok = await getAdminSession();
  return NextResponse.json({authenticated: ok});
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!verifyAdminPassword(body?.password)) {
      return NextResponse.json({error: 'Invalid password'}, {status: 401});
    }
    const token = createAdminToken();
    const response = NextResponse.json({ok: true});
    response.cookies.set(adminCookieOptions(token));
    return response;
  } catch {
    return NextResponse.json({error: 'Unable to sign in'}, {status: 400});
  }
}

export async function DELETE() {
  const response = NextResponse.json({ok: true});
  response.cookies.set(clearAdminCookieOptions());
  return response;
}
