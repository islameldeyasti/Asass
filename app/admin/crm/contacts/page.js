import {requireAdminPage} from '@/lib/cms/guard';
import {PERMS} from '@/lib/cms/permissions';
import {listContacts} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import EmptyState from '@/components/admin/ui/EmptyState';
import {Users} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminCrmContactsPage() {
  const {user, navItems} = await requireAdminPage(PERMS.ENQUIRIES_READ);
  const contacts = await listContacts();

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Contacts"
      subtitle={`${contacts.length} unique contacts from enquiries`}
      breadcrumb={
        <nav className="cms-breadcrumb" aria-label="Breadcrumb">
          <span>CRM</span>
          <span aria-hidden>/</span>
          <span>Contacts</span>
        </nav>
      }
    >
      {contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Contacts are derived automatically from enquiry submissions."
        />
      ) : (
        <div className="cms-card" style={{padding: 0, overflow: 'hidden'}}>
          <table className="cms-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Enquiries</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <strong>{contact.name || '—'}</strong>
                  </td>
                  <td>{contact.email || '—'}</td>
                  <td>{contact.phone || '—'}</td>
                  <td>{contact.company || '—'}</td>
                  <td>{Array.isArray(contact.enquiries) ? contact.enquiries.length : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
