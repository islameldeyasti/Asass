import {NextResponse} from 'next/server';
import {requireAdmin, publicUser} from '@/lib/cms/auth';
import {writeAudit} from '@/lib/cms/audit';
import {PERMS} from '@/lib/cms/permissions';
import {createUser, deleteUser, listUsers, toPublicUser, updateUser} from '@/lib/cms/users-store';

export const runtime = 'nodejs';

function errorResponse(error) {
  const status = error.status || 500;
  return NextResponse.json({error: error.message || 'Request failed'}, {status});
}

export async function GET() {
  try {
    await requireAdmin(PERMS.USERS_READ);
    const users = await listUsers();
    return NextResponse.json({users: users.map(toPublicUser)});
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const session = await requireAdmin(PERMS.USERS_WRITE);
    const body = await request.json();
    const user = await createUser({
      email: body.email,
      name: body.name,
      role: body.role,
      password: body.password,
      active: body.active !== false,
    });
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'user.create',
      entity: 'user',
      entityId: user.id,
      meta: {email: user.email, role: user.role},
    });
    return NextResponse.json({user: publicUser(user)}, {status: 201});
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request) {
  try {
    const session = await requireAdmin(PERMS.USERS_WRITE);
    const body = await request.json();
    if (!body?.id) {
      return NextResponse.json({error: 'User id is required'}, {status: 400});
    }
    const user = await updateUser(body.id, body);
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'user.update',
      entity: 'user',
      entityId: user.id,
      meta: {email: user.email, role: user.role, active: user.active},
    });
    return NextResponse.json({user: publicUser(user)});
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request) {
  try {
    const session = await requireAdmin(PERMS.USERS_WRITE);
    const body = await request.json().catch(() => ({}));
    const id = body?.id || new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({error: 'User id is required'}, {status: 400});
    }
    await deleteUser(id);
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'user.delete',
      entity: 'user',
      entityId: id,
    });
    return NextResponse.json({ok: true});
  } catch (error) {
    return errorResponse(error);
  }
}
