import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {PERMS} from '@/lib/cms/permissions';
import {saveTeamUpload} from '@/lib/team/store';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    await requireAdmin(PERMS.TEAM_WRITE);
    const form = await request.formData();
    const file = form.get('file');
    const url = await saveTeamUpload(file);
    return NextResponse.json({url});
  } catch (error) {
    return NextResponse.json({error: error.message || 'Upload failed'}, {status: error.status || 500});
  }
}
