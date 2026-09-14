import {NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/cms/auth';
import {PERMS} from '@/lib/cms/permissions';
import {
  getBlogPosts,
  getProjects,
  listEnquiries,
  listMedia,
} from '@/lib/cms/content-service';
import {listLetterheads} from '@/lib/cms/corporate/letterheads';
import {listTeamMembers} from '@/lib/team/store';

export const runtime = 'nodejs';

function matches(query, ...parts) {
  const hay = parts
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return hay.includes(query);
}

export async function GET(request) {
  try {
    await requireAdmin(PERMS.DASHBOARD);
    const {searchParams} = new URL(request.url);
    const q = String(searchParams.get('q') || '')
      .trim()
      .toLowerCase();

    if (!q || q.length < 2) {
      return NextResponse.json({results: []});
    }

    const [projects, posts, media, enquiries, team, letterheads] =
      await Promise.all([
        getProjects().catch(() => []),
        getBlogPosts().catch(() => []),
        listMedia().catch(() => []),
        listEnquiries().catch(() => []),
        listTeamMembers({includeDrafts: true}).catch(() => []),
        listLetterheads().catch(() => []),
      ]);

    const results = [];

    const corporateShortcuts = [
      {
        keys: ['letterhead', 'letter', 'new letterhead', 'corporate'],
        title: 'Letterhead Studio',
        subtitle: 'Corporate Tools',
        href: '/admin/corporate/letterheads',
      },
      {
        keys: ['new letterhead', 'create letter'],
        title: 'New Letterhead',
        subtitle: 'Corporate Tools',
        href: '/admin/corporate/letterheads?new=1',
      },
      {
        keys: ['employee card', 'employee cards', 'digital card', 'qr', 'vcard', 'corporate'],
        title: 'Employee Cards',
        subtitle: 'Corporate Tools',
        href: '/admin/corporate/employee-cards',
      },
    ];

    for (const shortcut of corporateShortcuts) {
      if (shortcut.keys.some((key) => q.includes(key) || key.includes(q))) {
        results.push({
          type: 'corporate',
          title: shortcut.title,
          subtitle: shortcut.subtitle,
          href: shortcut.href,
        });
      }
    }

    for (const project of projects) {
      if (
        matches(
          q,
          project.title,
          project.titleAr,
          project.slug,
          project.category,
          project.location,
        )
      ) {
        results.push({
          type: 'project',
          title: project.title || project.slug || 'Project',
          subtitle: project.slug || project.category || '',
          href: '/admin/projects',
        });
      }
    }

    for (const post of posts) {
      if (matches(q, post.title, post.titleAr, post.slug, post.excerpt)) {
        results.push({
          type: 'blog',
          title: post.title || post.slug || 'Post',
          subtitle: post.slug || '',
          href: '/admin/blog',
        });
      }
    }

    for (const member of team) {
      if (
        matches(
          q,
          member.name_en,
          member.name_ar,
          member.name,
          member.nameAr,
          member.slug,
          member.job_title_en,
          member.role,
          member.email,
          member.department_en,
        )
      ) {
        results.push({
          type: 'team',
          title: member.name_en || member.name || member.slug || 'Team member',
          subtitle: member.job_title_en || member.role || member.slug || '',
          href: '/admin/corporate/employee-cards',
        });
        results.push({
          type: 'team',
          title: `${member.name_en || member.name || 'Employee'} card`,
          subtitle: 'Employee Cards',
          href: '/admin/corporate/employee-cards',
        });
      }
    }

    for (const letter of letterheads) {
      if (
        matches(
          q,
          letter.title,
          letter.subject,
          letter.recipientName,
          letter.reference,
          letter.templateId,
        )
      ) {
        results.push({
          type: 'letterhead',
          title: letter.title || 'Letterhead',
          subtitle: letter.recipientName || letter.status || '',
          href: letter.id
            ? `/admin/corporate/letterheads/${letter.id}`
            : '/admin/corporate/letterheads',
        });
      }
    }

    for (const asset of media) {
      if (
        matches(
          q,
          asset.title,
          asset.name,
          asset.filename,
          asset.alt,
          asset.url,
          asset.id,
        )
      ) {
        results.push({
          type: 'media',
          title: asset.title || asset.name || asset.filename || asset.id || 'Media',
          subtitle: asset.mode || asset.mime || asset.url || '',
          href: '/admin/media',
        });
      }
    }

    for (const enquiry of enquiries) {
      if (
        matches(
          q,
          enquiry.name,
          enquiry.fullName,
          enquiry.email,
          enquiry.phone,
          enquiry.subject,
          enquiry.company,
          enquiry.message,
        )
      ) {
        results.push({
          type: 'enquiry',
          title: enquiry.name || enquiry.fullName || enquiry.email || 'Enquiry',
          subtitle: enquiry.email || enquiry.status || '',
          href: '/admin/crm/enquiries',
        });
      }
    }

    // Dedupe by href+title
    const seen = new Set();
    const unique = [];
    for (const item of results) {
      const key = `${item.href}|${item.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }

    return NextResponse.json({results: unique.slice(0, 40)});
  } catch (error) {
    return NextResponse.json(
      {error: error.message || 'Search failed'},
      {status: error.status || 500},
    );
  }
}
