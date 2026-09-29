
import {adminText} from '@/lib/admin/translate';
import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';
import {listContacts} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import EmptyState from '@/components/admin/ui/EmptyState';
import ClientDataTable from '@/components/admin/ui/ClientDataTable';
import {Users} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCrmContactsPage() {
  const {user, navItems} = await requireAdminPage(PERMS.ENQUIRIES_READ);
  const contacts = await listContacts();

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title={adminText("Contacts")}
      subtitle={adminText(`${contacts.length} unique contacts from enquiries`)}
      breadcrumb={
        <nav className="cms-breadcrumb" aria-label={adminText("Breadcrumb")}>
          <span>{adminText("CRM")}</span>
          <span aria-hidden>/</span>
          <span>{adminText("Contacts")}</span>
        </nav>
      }
    >
      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title={adminText("No contacts yet")}
          description={adminText("Contacts are derived automatically from enquiry submissions.")}
        />
      ) : (
        <ClientDataTable
          title="Contacts"
          filename="contacts"
          columns={[
            {key: 'name', label: 'Name'},
            {key: 'email', label: 'Email'},
            {key: 'phone', label: 'Phone'},
            {key: 'company', label: 'Company'},
            {key: 'enquiryCount', label: 'Enquiries'},
          ]}
          rows={contacts.map((contact) => ({
            ...contact,
            enquiryCount: Array.isArray(contact.enquiries) ? contact.enquiries.length : 0,
          }))}
        />
      )}
    </AdminShell>
  );
}
