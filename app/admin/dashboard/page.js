import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS, ROLE_LABELS} from '@/lib/cms/permissions';
import {listTeamMembers} from '@/lib/team/store';
import {listUsers} from '@/lib/cms/users-store';
import {listAudit} from '@/lib/cms/audit';
import {
  getBlogPosts,
  getProjects,
  getServices,
  getJobs,
  listEnquiries,
  listMedia,
} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import DashboardHome from '@/components/admin/ui/DashboardHome';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const {user, navItems} = await requireAdminPage(PERMS.DASHBOARD);
  const [members, users, posts, projects, services, jobs, enquiries, media, activity] =
    await Promise.all([
      listTeamMembers({includeDrafts: true}),
      listUsers(),
      getBlogPosts(),
      getProjects(),
      getServices(),
      getJobs(),
      listEnquiries(),
      listMedia(),
      listAudit({limit: 12}),
    ]);

  const newEnquiries = enquiries.filter(
    (item) => String(item?.status || 'new').toLowerCase() === 'new',
  ).length;

  const stats = [
    {label: 'Projects', value: projects.length, href: '/admin/projects'},
    {label: 'Blog posts', value: posts.length, href: '/admin/blog'},
    {label: 'Services', value: services.length, href: '/admin/services'},
    {
      label: 'Enquiries',
      value: enquiries.length,
      href: '/admin/crm/enquiries',
      hint: newEnquiries ? `${newEnquiries} new` : undefined,
    },
    {label: 'Team', value: members.length, href: '/admin/team'},
    {
      label: 'Open roles',
      value: jobs.filter((j) => j.status === 'open').length,
      href: '/admin/careers',
    },
    {label: 'Media', value: media.length, href: '/admin/media'},
    {label: 'Users', value: users.length, href: '/admin/users'},
  ];

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Dashboard"
      subtitle="Overview of content, CRM, and recent changes"
    >
      <DashboardHome
        stats={stats}
        newEnquiries={newEnquiries}
        activity={activity}
        roleLabel={ROLE_LABELS[user.role] || user.role}
      />
    </AdminShell>
  );
}
