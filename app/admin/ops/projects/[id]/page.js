
import {adminText} from '@/lib/admin/translate';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import Project360View from '@/components/admin/ops/Project360View';
import {listDepartments} from '@/lib/ops/departments';
import {listEmployees} from '@/lib/ops/employees';
import {getProject360} from '@/lib/ops/projects';

export const dynamic = 'force-dynamic';

export default async function OpsProject360Page({params}) {
  const {id} = await params;
  const {user, navItems, session} = await requireAdminPage(PERMS.OPS_PROJECTS_READ);
  const [data, employees, departments] = await Promise.all([
    getProject360(id),
    listEmployees(),
    listDepartments({includeInactive: true}),
  ]);
  if (!data) notFound();

  const canWrite = hasPermission(session.role, PERMS.OPS_PROJECTS_WRITE);
  const canWriteDocs = hasPermission(session.role, PERMS.OPS_DOCS_WRITE);
  const canWriteApprovals = hasPermission(session.role, PERMS.OPS_APPROVALS_WRITE);
  const canWriteMeetings = hasPermission(session.role, PERMS.OPS_MEETINGS_WRITE);
  const canWriteComments = canWrite;

  const breadcrumb = (
    <nav className="cms-breadcrumb" aria-label={adminText("Breadcrumb")}>
      <Link href="/admin/ops">{adminText("Operations")}</Link>
      <span className="cms-breadcrumb-sep" aria-hidden>
        /
      </span>
      <Link href="/admin/ops/projects">{adminText("Projects")}</Link>
      <span className="cms-breadcrumb-sep" aria-hidden>
        /
      </span>
      <span className="cms-breadcrumb-current">{adminText(data.project.code)}</span>
    </nav>
  );

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText(data.project.nameEn)}
      subtitle={adminText(`Project 360 · ${data.project.code}`)}
      breadcrumb={breadcrumb}
    >
      <Project360View
        initialData={data}
        employees={employees}
        departments={departments}
        canWrite={canWrite}
        canWriteDocs={canWriteDocs}
        canWriteApprovals={canWriteApprovals}
        canWriteMeetings={canWriteMeetings}
        canWriteComments={canWriteComments}
      />
    </AdminShell>
  );
}
