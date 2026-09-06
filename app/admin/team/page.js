import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getAdminSession} from '@/lib/team/auth';
import {listTeamMembers} from '@/lib/team/store';
import AdminSignOut from '@/components/admin/AdminSignOut';

export const dynamic = 'force-dynamic';

export default async function AdminTeamListPage() {
  const ok = await getAdminSession();
  if (!ok) redirect('/admin/login');

  const members = await listTeamMembers({includeDrafts: true});

  return (
    <div className="adm-shell">
      <div className="adm-top">
        <div className="adm-brand">
          <strong>ASAS Admin</strong>
          <span>Team members · {members.length} total</span>
        </div>
        <div className="adm-actions">
          <Link className="adm-btn" href="/admin/team/new">
            Add team member
          </Link>
          <AdminSignOut />
        </div>
      </div>

      <div className="adm-card">
        {members.length === 0 ? (
          <div className="adm-empty">
            <p>No team members yet. Create the first profile to populate /en/team and the homepage section.</p>
            <Link className="adm-btn" href="/admin/team/new">
              Create team member
            </Link>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Title</th>
                <th>Order</th>
                <th>Flags</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    {member.profile_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="adm-thumb" src={member.profile_image} alt="" />
                    ) : (
                      <div className="adm-thumb" />
                    )}
                  </td>
                  <td>
                    <strong>{member.name_en}</strong>
                    <div style={{color: '#5b6472', fontSize: 12}}>{member.slug}</div>
                  </td>
                  <td>{member.job_title_en}</td>
                  <td>{member.display_order}</td>
                  <td>
                    {[member.leadership ? 'Leadership' : null, member.featured ? 'Featured' : null]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </td>
                  <td>
                    <span className={`adm-badge ${member.status}`}>{member.status}</span>
                  </td>
                  <td>
                    <Link className="adm-btn-ghost" href={`/admin/team/${member.id}`}>
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
