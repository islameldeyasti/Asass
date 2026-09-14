import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '@/lib/cms/auth';
import {PERMS} from '@/lib/cms/permissions';
import {createTeamMember, listTeamMembers} from '@/lib/team/store';

export const runtime = 'nodejs';

function revalidateTeamPublic() {
  revalidatePath('/en');
  revalidatePath('/ar');
  revalidatePath('/en/team');
  revalidatePath('/ar/team');
  revalidatePath('/sitemap.xml');
}

export async function GET() {
  try {
    await requireAdmin(PERMS.TEAM_READ);
    const members = await listTeamMembers({includeDrafts: true});
    return NextResponse.json({members});
  } catch (error) {
    return NextResponse.json({error: error.message || 'Unauthorized'}, {status: error.status || 401});
  }
}

export async function POST(request) {
  try {
    await requireAdmin(PERMS.TEAM_WRITE);
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
