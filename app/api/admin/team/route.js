import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {getAdminSession} from '@/lib/team/auth';
import {createTeamMember, listTeamMembers} from '@/lib/team/store';

export const runtime = 'nodejs';

function revalidateTeamPublic() {
  revalidatePath('/en');
  revalidatePath('/ar');
  revalidatePath('/en/team');
  revalidatePath('/ar/team');
  revalidatePath('/sitemap.xml');
}

async function requireAdmin() {
  const ok = await getAdminSession();
  if (!ok) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const members = await listTeamMembers({includeDrafts: true});
  return NextResponse.json({members});
}

export async function POST(request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await request.json();
    const member = await createTeamMember(body);
    revalidateTeamPublic();
    if (member.slug) {
      revalidatePath(`/en/team/${member.slug}`);
      revalidatePath(`/ar/team/${member.slug}`);
    }
    return NextResponse.json({member}, {status: 201});
  } catch (error) {
    return NextResponse.json({error: error.message || 'Create failed'}, {status: error.status || 500});
  }
}
