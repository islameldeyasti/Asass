import {NextResponse} from 'next/server';
import {getAdminSession} from '@/lib/team/auth';
import {saveTeamUpload} from '@/lib/team/store';

export const runtime = 'nodejs';

export async function POST(request) {
  const ok = await getAdminSession();
  if (!ok) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  try {
    const form = await request.formData();
    const file = form.get('file');
    const url = await saveTeamUpload(file);
    return NextResponse.json({url});
  } catch (error) {
    return NextResponse.json({error: error.message || 'Upload failed'}, {status: error.status || 500});
  }
}
