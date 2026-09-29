import {NextResponse} from 'next/server';
import {requireAdmin, publicUser} from '@/lib/cms/auth';
import {comparePassword} from '@/lib/cms/password';
import {writeAudit} from '@/lib/cms/audit';
import {getUserById, saveProfilePhoto, toPublicUser, updateUser} from '@/lib/cms/users-store';

export const runtime = 'nodejs';

const PROFILE_FIELDS = [
  'name',
  'photoUrl',
  'jobTitle',
  'department',
  'phone',
  'whatsapp',
  'birthday',
  'gender',
  'nationality',
  'city',
  'country',
  'address',
  'bio',
  'linkedin',
  'availability',
  'publicProfile',
];

function errorResponse(error) {
  return NextResponse.json({error: error.message || 'Request failed'}, {status: error.status || 500});
}

export async function GET() {
  try {
    const session = await requireAdmin();
    const user = await getUserById(session.user.id);
    if (!user) return NextResponse.json({error: 'User not found'}, {status: 404});
    return NextResponse.json({user: toPublicUser(user)});
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request) {
  try {
    const session = await requireAdmin();
    const current = await getUserById(session.user.id);
    if (!current) return NextResponse.json({error: 'User not found'}, {status: 404});

    const contentType = request.headers.get('content-type') || '';
    let body = {};
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      body = Object.fromEntries(form.entries());
      const file = form.get('photo');
      if (file && typeof file !== 'string') {
        body.photoUrl = await saveProfilePhoto(file);
      }
    } else {
      body = await request.json();
    }

    if (body.password) {
      if (!body.currentPassword) {
        return NextResponse.json({error: 'Current password is required'}, {status: 400});
      }
      const ok = await comparePassword(String(body.currentPassword), current.passwordHash);
      if (!ok) return NextResponse.json({error: 'Current password is incorrect'}, {status: 400});
      if (String(body.password).length < 6) {
        return NextResponse.json({error: 'New password must be at least 6 characters'}, {status: 400});
      }
    }

    const patch = {};
    for (const key of PROFILE_FIELDS) {
      if (body[key] != null) patch[key] = body[key];
    }
    if (body.password) patch.password = String(body.password);
    if (patch.publicProfile != null) {
      patch.publicProfile = patch.publicProfile === true || patch.publicProfile === 'true';
    }

    const user = await updateUser(current.id, patch);
    await writeAudit({
      actorId: session.user.id,
      actorEmail: session.user.email,
      action: 'user.profile',
      entity: 'user',
      entityId: user.id,
    });
    return NextResponse.json({user: publicUser(user), profile: toPublicUser(user)});
  } catch (error) {
    return errorResponse(error);
  }
}
