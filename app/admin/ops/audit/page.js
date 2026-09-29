
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';
import AdminShell from '@/components/admin/AdminShell';
import OpsAuditViewer from '@/components/admin/ops/OpsAuditViewer';
import {listOpsAudit} from '@/lib/ops/insights';

export const dynamic = 'force-dynamic';

export default async function OpsAuditPage() {
  const {user, navItems} = await requireAdminPage(PERMS.OPS_REPORTS);
  const items = await listOpsAudit({limit: 100});

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Ops Audit")}
      subtitle={adminText("Searchable operations activity trail")}
    >
      <OpsAuditViewer initialItems={items} />
    </AdminShell>
  );
}
