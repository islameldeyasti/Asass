import Link from 'next/link';
import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';
import {listTeamMembers} from '@/lib/team/store';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminTeamListPage() {
  const {user, navItems} = await requireAdminPage(PERMS.TEAM_READ);
  const members = await listTeamMembers({includeDrafts: true});

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Team"
      subtitle={`${members.length} profiles`}
      actions={
        <Link className="adm-btn" href="/admin/team/new">
          Add team member
        </Link>
      }
    >
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
    </AdminShell>
  );
}
