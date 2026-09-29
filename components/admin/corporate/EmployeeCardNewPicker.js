'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import Link from 'next/link';
import {ArrowLeft, IdCard} from 'lucide-react';
import {normalizeDigitalCard} from '@/lib/cms/corporate/employee-cards';

export default function EmployeeCardNewPicker({members = []}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name_en, m.name_ar, m.job_title_en, m.department_en, m.email, m.slug]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [members, query]);

  return (
    <div className="ecs-studio" style={{display: 'grid', gap: 16}}>
      <div className="cms-card ecs-toolbar" style={{display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', gap: 12, alignItems: 'flex-start'}}>
          <Link className="adm-btn-ghost" href="/admin/corporate/employee-cards">
            <ArrowLeft size={14} />{adminText(" Back")}</Link>
          <div>
            <strong>{adminText("Add employee card")}</strong>
            <p style={{margin: '4px 0 0', color: 'var(--cms-muted)'}}>{adminText("Choose a team member to open their card editor on a full page.")}</p>
          </div>
        </div>
        <input
          className="adm-input"
          style={{maxWidth: 260}}
          placeholder={adminText("Search team member…")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="cms-card" style={{padding: 0, overflow: 'hidden'}}>
        {filtered.length === 0 ? (
          <div className="adm-empty" style={{padding: 32}}>
            <p>{adminText("No team members found. Create a team profile first.")}</p>
            <div style={{marginTop: 12}}>
              <Link className="adm-btn" href="/admin/team/new">{adminText("Add team member")}</Link>
            </div>
          </div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>{adminText("Photo")}</th>
                <th>{adminText("Employee")}</th>
                <th>{adminText("Card status")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => {
                const card = normalizeDigitalCard(member.digital_card);
                const status =
                  !card.enabled || card.status === 'disabled'
                    ? adminText('disabled')
                    : card.status || adminText('draft');
                return (
                  <tr key={member.id}>
                    <td>
                      {member.profile_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="adm-thumb" src={member.profile_image} alt={adminText("")} />
                      ) : (
                        <div className="adm-thumb" />
                      )}
                    </td>
                    <td>
                      <strong>{adminText(member.name_en)}</strong>
                      <div style={{color: 'var(--cms-muted)', fontSize: 12}}>
                        {adminText(member.job_title_en)}
                        {adminText(member.department_en ? ` · ${member.department_en}` : '')}
                      </div>
                    </td>
                    <td>
                      <span className={`adm-badge ${status === 'published' ? 'published' : 'draft'}`}>
                        {adminText(status)}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="adm-btn"
                        href={`/admin/corporate/employee-cards/${member.id}`}
                      >
                        <IdCard size={14} />{adminText(" Open card editor")}</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
