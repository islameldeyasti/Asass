import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {getAdminSession} from '@/lib/team/auth';
import {deleteTeamMember, getTeamMemberById, updateTeamMember} from '@/lib/team/store';

export const runtime = 'nodejs';

function revalidateTeamPublic(slug) {
  revalidatePath('/en');
  revalidatePath('/ar');
  revalidatePath('/en/team');
  revalidatePath('/ar/team');
  revalidatePath('/sitemap.xml');
  if (slug) {
    revalidatePath(`/en/team/${slug}`);
    revalidatePath(`/ar/team/${slug}`);
  }
}

async function requireAdmin() {
  const ok = await getAdminSession();
  if (!ok) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }
  return null;
}

export async function GET(_request, {params}) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const {id} = await params;
  const member = await getTeamMemberById(id);
  if (!member) return NextResponse.json({error: 'Not found'}, {status: 404});
  return NextResponse.json({member});
}

export async function PUT(request, {params}) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const {id} = await params;
    const existing = await getTeamMemberById(id);
    const body = await request.json();
    const member = await updateTeamMember(id, body);
    revalidateTeamPublic(member.slug);
    if (existing?.slug && existing.slug !== member.slug) {
      revalidatePath(`/en/team/${existing.slug}`);
      revalidatePath(`/ar/team/${existing.slug}`);
    }
    return NextResponse.json({member});
  } catch (error) {
    return NextResponse.json({error: error.message || 'Update failed'}, {status: error.status || 500});
  }
}

export async function DELETE(_request, {params}) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const {id} = await params;
    const existing = await getTeamMemberById(id);
    await deleteTeamMember(id);
    revalidateTeamPublic(existing?.slug);
    return NextResponse.json({ok: true});
  } catch (error) {
    return NextResponse.json({error: error.message || 'Delete failed'}, {status: error.status || 500});
  }
}
