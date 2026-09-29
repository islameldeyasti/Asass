import {listEmployees, saveEmployee} from './employees';
import {listClients, saveClient} from './clients';
import {getClients as getWebsiteClients, saveClient as saveWebsiteClient} from '@/lib/cms/content-service';
import {listUsers} from '@/lib/cms/users-store';
import {listTeamMembers} from '@/lib/team/store';

function slugify(value) {
  return String(value || 'client')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export async function syncIdentities() {
  const [employees, opsClients, websiteClients, users, team] = await Promise.all([
    listEmployees(),
    listClients({includeInactive: true}),
    getWebsiteClients(),
    listUsers(),
    listTeamMembers({includeDrafts: true}).catch(() => []),
  ]);

  let linkedEmployees = 0;
  for (const employee of employees) {
    const patch = {};
    if (employee.email) {
      const user = users.find((item) => item.email === employee.email);
      if (user && employee.cmsUserId !== user.id) patch.cmsUserId = user.id;
      const member = team.find(
        (item) =>
          String(item.email || '').toLowerCase() === employee.email ||
          String(item.name_en || '').trim().toLowerCase() === employee.fullNameEn.toLowerCase(),
      );
      if (member && employee.teamMemberId !== member.id) patch.teamMemberId = member.id;
    }
    if (Object.keys(patch).length) {
      await saveEmployee({...employee, ...patch});
      linkedEmployees += 1;
    }
  }

  let linkedClients = 0;
  const site = [...websiteClients];
  for (const client of opsClients) {
        let website = site.find(
      (item) =>
        item.id === client.websiteClientId ||
        String(item.name || item.nameEn || '').trim().toLowerCase() === client.nameEn.toLowerCase(),
    );
    if (!website) {
      website = await saveWebsiteClient({
        id: `web-${slugify(client.code || client.nameEn)}`,
        name: client.nameEn,
        nameAr: client.nameAr,
        logo: '',
        relationship: 'CLIENT',
        status: client.active ? 'published' : 'draft',
      });
      site.push(website);
    }
    if (client.websiteClientId !== website.id) {
      await saveClient({...client, websiteClientId: website.id});
      linkedClients += 1;
    }
  }

  return {
    employees: employees.length,
    linkedEmployees,
    clients: opsClients.length,
    linkedClients,
    users: users.length,
    team: team.length,
  };
}
