import {NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {requireAdmin} from '@/lib/cms/auth';
import {writeAudit} from '@/lib/cms/audit';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
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
    revalidatePath(`/en/card/${slug}`);
    revalidatePath(`/ar/card/${slug}`);
  }
  revalidatePath('/c/[publicId]');
}

function cardOnlyKeys(body = {}) {
  const keys = Object.keys(body || {});
  const allowed = new Set([
    'digital_card',
    'profile_image',
    'profile_image_focal',
  ]);
  return keys.length > 0 && keys.every((key) => allowed.has(key));
}

export async function GET(_request, {params}) {
  try {
    await requireAdmin(PERMS.TEAM_READ);
    const {id} = await params;
    const member = await getTeamMemberById(id);
    if (!member) return NextResponse.json({error: 'Not found'}, {status: 404});
    return NextResponse.json({member});
  } catch (error) {
    return NextResponse.json({error: error.message || 'Unauthorized'}, {status: error.status || 401});
  }
}

export async function PUT(request, {params}) {
  try {
    const session = await requireAdmin();
    const {id} = await params;
    const existing = await getTeamMemberById(id);
    if (!existing) return NextResponse.json({error: 'Not found'}, {status: 404});

    const body = await request.json();
    const canTeamWrite = hasPermission(session.role, PERMS.TEAM_WRITE);
    const canCardWrite = hasPermission(session.role, PERMS.EMPLOYEE_CARDS_WRITE);
    const canPublish = hasPermission(session.role, PERMS.EMPLOYEE_CARDS_PUBLISH);

    if (!canTeamWrite && !canCardWrite) {
      return NextResponse.json({error: 'Forbidden'}, {status: 403});
    }

    let payload = body;
    if (!canTeamWrite && canCardWrite) {
      if (!cardOnlyKeys(body)) {
        return NextResponse.json(
          {error: 'Employee card editors may only update card fields and photo'},
          {status: 403},
        );
      }
      payload = {
        digital_card: body.digital_card,
        profile_image: body.profile_image,
        profile_image_focal: body.profile_image_focal,
      };
    }

    if (
      payload.digital_card?.status === 'published' &&
      !canPublish &&
      !canTeamWrite
    ) {
      return NextResponse.json({error: 'Publish permission required'}, {status: 403});
    }

    const member = await updateTeamMember(id, payload);
    revalidateTeamPublic(member.slug);
    if (existing?.slug && existing.slug !== member.slug) {
      revalidatePath(`/en/team/${existing.slug}`);
      revalidatePath(`/ar/team/${existing.slug}`);
      revalidatePath(`/en/card/${existing.slug}`);
      revalidatePath(`/ar/card/${existing.slug}`);
    }

    const prevCard = existing.digital_card || {};
    const nextCard = member.digital_card || {};
    if (JSON.stringify(prevCard) !== JSON.stringify(nextCard)) {
      let action = 'employee_card.update';
      if (nextCard.status === 'published' && prevCard.status !== 'published') {
        action = 'employee_card.publish';
      } else if (
        nextCard.status === 'disabled' &&
        prevCard.status !== 'disabled'
      ) {
        action = 'employee_card.disable';
      }
      await writeAudit({
        actorId: session.user?.id,
        actorEmail: session.user?.email,
        action,
        entity: 'employee_card',
        entityId: member.id,
        meta: {
          slug: member.slug,
          status: nextCard.status,
          templateId: nextCard.templateId,
        },
      });
    }

    return NextResponse.json({member});
  } catch (error) {
    return NextResponse.json(
      {error: error.message || 'Update failed'},
      {status: error.status || 500},
    );
  }
}

export async function DELETE(_request, {params}) {
  try {
    await requireAdmin(PERMS.TEAM_WRITE);
    const {id} = await params;
    const existing = await getTeamMemberById(id);
    await deleteTeamMember(id);
    revalidateTeamPublic(existing?.slug);
    return NextResponse.json({ok: true});
  } catch (error) {
    return NextResponse.json(
      {error: error.message || 'Delete failed'},
      {status: error.status || 500},
    );
  }
}
