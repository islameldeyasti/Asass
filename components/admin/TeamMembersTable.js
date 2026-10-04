'use client';

import {useMemo, useState} from 'react';
import Link from 'next/link';
import {adminText} from '@/lib/admin/translate';
import TableDataBar, {uniqueFilterOptions} from '@/components/admin/ui/TableDataBar';

export default function TeamMembersTable({members}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const columns = [
    {key: 'name_en', label: 'Name'},
    {key: 'slug', label: 'Slug'},
    {key: 'job_title_en', label: 'Title'},
    {key: 'display_order', label: 'Order'},
    {key: 'status', label: 'Status'},
  ];
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((member) => {
      if (filter && member.status !== filter) return false;
      if (!q) return true;
      return [member.name_en, member.slug, member.job_title_en].join(' ').toLowerCase().includes(q);
    });
  }, [members, query, filter]);

  return (
    <>
      <TableDataBar
        query={query}
        onQuery={setQuery}
        filter={filter}
        onFilter={setFilter}
        filterLabel="All statuses"
        filterOptions={uniqueFilterOptions(members, 'status')}
        columns={columns}
        rows={visible}
        filename="team"
        title="Team"
      />
      <table className="adm-table">
        <thead>
          <tr>
            <th>{adminText('Photo')}</th>
            <th>{adminText('Name')}</th>
            <th>{adminText('Title')}</th>
            <th>{adminText('Order')}</th>
            <th>{adminText('Flags')}</th>
            <th>{adminText('Status')}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {visible.map((member) => (
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
                {adminText(
                  [member.leadership ? 'Leadership' : null, member.featured ? 'Featured' : null]
                    .filter(Boolean)
                    .join(' · ') || '—',
                )}
              </td>
              <td>
                <span className={`adm-badge ${member.status}`}>{adminText(member.status)}</span>
              </td>
              <td>
                <Link className="adm-btn-ghost" href={`/admin/team/${member.id}`}>
                  {adminText('Edit')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
