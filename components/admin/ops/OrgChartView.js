'use client';
import {adminText} from '@/lib/admin/translate';


import {useState} from 'react';
import {OpsMetrics, OpsAvatar, OpsEmpty} from './OpsUI';
import Link from 'next/link';

export default function OrgChartView({chart}) {
  const [query,setQuery]=useState('');
  const [hideEmpty,setHideEmpty]=useState(false);
  const [collapsed,setCollapsed]=useState({});
  const departments = chart?.departments || [];
  const unassigned = chart?.unassigned || [];

  const visible = departments.filter(d=>(!hideEmpty || d.employees?.length) && `${d.nameEn} ${d.nameAr} ${(d.employees||[]).map(e=>e.fullNameEn).join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="ops-org adm-stack">
      <OpsMetrics items={[{label:'Organizational units',value:departments.length,hint:'Active departments'},{label:'Team members',value:chart?.totals?.employees||0,hint:'Active and on-leave employees'},{label:'Heads assigned',value:departments.filter(d=>d.head).length,hint:'Named department leadership',tone:'good'},{label:'Unassigned people',value:unassigned.length,hint:'Employees without an active department',tone:'warning'}]}/>
      <div className="ops-toolbar"><input aria-label={adminText("Search organization")} placeholder={adminText("Find a department or colleague…")} value={query} onChange={e=>setQuery(e.target.value)}/><label className="adm-check"><input type="checkbox" checked={hideEmpty} onChange={e=>setHideEmpty(e.target.checked)}/>{adminText("Hide empty departments")}</label></div>
      <div className="ops-org-root">
        <div className="ops-org-node ops-org-gm">
          <span className="ops-org-kicker">{adminText("General Management")}</span>
          <strong>{adminText("ASAS Leadership")}</strong>
          <p>{adminText("Department leadership and delivery teams")}</p>
        </div>
      </div>

      <div className="ops-org-grid">
        {visible.map((dept) => (
          <section key={dept.id} className="ops-org-dept">
            <header>
<div className="ops-results"><h3>{dept.nameEn}</h3><button className="adm-btn-ghost" aria-label={adminText(`Toggle ${dept.nameEn}`)} aria-expanded={!collapsed[dept.id]} onClick={()=>setCollapsed({...collapsed,[dept.id]:!collapsed[dept.id]})}>{adminText(collapsed[dept.id]?'+':'−')}</button></div>
              <p dir="rtl">{dept.nameAr}</p>
              {dept.head ? (
                <Link href={`/admin/ops/employees`} className="ops-org-head">{adminText("Head: ")}{dept.head.fullNameEn}
                </Link>
              ) : (
                <span className="ops-org-muted">{adminText("No department head set")}</span>
              )}
            </header>
            <ul hidden={collapsed[dept.id]}>
              {(dept.employees || []).map((emp) => (
                <li key={emp.id}>
                  <Link href="/admin/ops/employees">
                    <div className="ops-person"><OpsAvatar name={emp.fullNameEn}/><strong>{emp.fullNameEn}</strong></div>
                    <span>{adminText(emp.jobTitleEn || 'Staff')}</span>
                  </Link>
                </li>
              ))}
              {!dept.employees?.length ? (
                <li className="ops-org-muted">{adminText("No employees assigned")}</li>
              ) : null}
            </ul>
          </section>
        ))}
      </div>

      {!visible.length&&<OpsEmpty/>}
      {unassigned.length ? (
        <section className="ops-org-unassigned">
          <h3>{adminText("Unassigned employees")}</h3>
          <ul>
            {unassigned.map((emp) => (
              <li key={emp.id}>
                <Link href="/admin/ops/employees">
                  {emp.fullNameEn} — {adminText(emp.jobTitleEn || 'Staff')}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
