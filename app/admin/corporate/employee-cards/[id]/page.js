import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getTeamMemberById, listTeamMembers} from '@/lib/team/store';
import {company} from '@/data/company';
import {getBranding} from '@/lib/cms/branding-server';
import AdminShell from '@/components/admin/AdminShell';
import EmployeeCardEditor from '@/components/admin/corporate/EmployeeCardEditor';

export const dynamic = 'force-dynamic';

export default async function AdminEmployeeCardEditPage({params}) {
  const {user, navItems, session} = await requireAdminPage(PERMS.EMPLOYEE_CARDS_READ);
  const {id} = await params;
  const [member, branding, peers] = await Promise.all([
    getTeamMemberById(id),
    getBranding(),
    listTeamMembers({includeDrafts: true}),
  ]);
  if (!member) notFound();

  const canWrite = hasPermission(session.role, PERMS.EMPLOYEE_CARDS_WRITE);
  const canPublish = hasPermission(session.role, PERMS.EMPLOYEE_CARDS_PUBLISH);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={member.name_en || 'Edit card'}
      subtitle="Digital business card studio"
      actions={
        <Link className="adm-btn-ghost" href="/admin/corporate/employee-cards">
          Back to cards
        </Link>
      }
    >
      <EmployeeCardEditor
        member={member}
        company={company}
        branding={branding}
        peers={peers}
        canWrite={canWrite || hasPermission(session.role, PERMS.TEAM_WRITE)}
        canPublish={canPublish || hasPermission(session.role, PERMS.TEAM_WRITE)}
      />
    </AdminShell>
  );
}
