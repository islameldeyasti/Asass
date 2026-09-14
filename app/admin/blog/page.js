import {requireAdminPage} from '@/lib/cms/guard';
import {hasPermission, PERMS} from '@/lib/cms/permissions';
import {getBlogPosts} from '@/lib/cms/content-service';
import AdminShell from '@/components/admin/AdminShell';
import CollectionTable from '@/components/admin/CollectionTable';

export const dynamic = 'force-dynamic';

const FIELDS = [
  {key: 'title', label: 'Title (EN)', type: 'text'},
  {key: 'titleAr', label: 'Title (AR)', type: 'text', dir: 'rtl'},
  {key: 'slug', label: 'Slug', type: 'text'},
  {key: 'excerpt', label: 'Excerpt (EN)', type: 'textarea'},
  {key: 'excerptAr', label: 'Excerpt (AR)', type: 'textarea', dir: 'rtl'},
  {key: 'category', label: 'Category', type: 'text'},
  {key: 'date', label: 'Date', type: 'text'},
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      {value: 'draft', label: 'Draft'},
      {value: 'published', label: 'Published'},
    ],
  },
  {
    key: 'body',
    label: 'Body (EN)',
    type: 'paragraphs',
    rows: 8,
    hint: 'Separate paragraphs with a blank line.',
  },
  {
    key: 'bodyAr',
    label: 'Body (AR)',
    type: 'paragraphs',
    rows: 8,
    dir: 'rtl',
    hint: 'Separate paragraphs with a blank line.',
  },
  {key: 'cover', label: 'Cover image', type: 'image'},
];

export default async function AdminBlogPage() {
  const {user, navItems, session} = await requireAdminPage(PERMS.BLOG_READ);
  const items = await getBlogPosts();
  const canWrite = hasPermission(session.role, PERMS.BLOG_WRITE);

  return (
    <AdminShell
      user={user}
      navItems={navItems}
      title="Blog"
      subtitle={`${items.length} posts`}
    >
      <CollectionTable
        resource="blog-posts"
        items={items}
        titleKey="title"
        slugKey="slug"
        canWrite={canWrite}
        fields={FIELDS}
        createDefaults={{status: 'draft', body: [], bodyAr: []}}
      />
    </AdminShell>
  );
}
