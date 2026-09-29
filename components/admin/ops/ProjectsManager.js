'use client';
import {adminText} from '@/lib/admin/translate';


import {useMemo, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import {OpsMetrics, OpsEmpty} from './OpsUI';
import {projectHealth} from '@/lib/ops/presentation';
import TableDataBar from '@/components/admin/ui/TableDataBar';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import {PROJECT_PRIORITIES, PROJECT_STATUSES} from '@/lib/ops/constants';

const EMPTY = {
  nameEn: '',
  nameAr: '',
  code: '',
  clientId: '',
  projectType: '',
  sector: '',
  location: '',
  emirate: '',
  country: 'UAE',
  descriptionEn: '',
  descriptionAr: '',
  contractValue: '',
  startDate: '',
  plannedEndDate: '',
  actualEndDate: '',
  projectManagerId: '',
  projectDirectorId: '',
  status: 'planning',
  priority: 'normal',
  progress: 0,
};

export default function ProjectsManager({
  initialProjects = [],
  clients = [],
  employees = [],
  canWrite = false,
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialProjects);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [view, setView] = useState('table');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c.nameEn])),
    [clients],
  );
  const empMap = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn])),
    [employees],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (clientFilter && p.clientId !== clientFilter) return false;
      if (!q) return true;
      return [p.nameEn, p.code, clientMap[p.clientId], p.location]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, statusFilter, clientMap, clientFilter]);

  const tableColumns = [
    {key:'code',label:'Code'},
    {key:'nameEn',label:'Project'},
    {key:'status',label:'Status'},
    {key:'plannedEndDate',label:'Planned completion'},
    {key:'progress',label:'Progress %'},
    {key:'clientId',label:'Client'},
    {key:'location',label:'Location'},
  ];

  async function importExcel(mapped) {
    if (!canWrite) return;
    setSaving(true);
    setError('');
    try {
      for (const row of mapped) {
        const res = await fetch('/api/admin/ops', {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            resource: 'projects',
            document: {
              ...EMPTY,
              ...row,
              id: undefined,
              contractValue: row.contractValue === '' || row.contractValue == null ? null : Number(row.contractValue),
              progress: Number(row.progress) || 0,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Import failed');
      }
      router.refresh();
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setSaving(false);
    }
  }

  async function onSave(event) {
    event.preventDefault();
    if (!canWrite || !draft) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...draft,
        clientId: draft.clientId || null,
        projectManagerId: draft.projectManagerId || null,
        projectDirectorId: draft.projectDirectorId || null,
        contractValue: draft.contractValue === '' ? null : Number(draft.contractValue),
        progress: Number(draft.progress) || 0,
      };
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({resource: 'projects', document: payload}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setItems((current) => {
        const next = current.filter((p) => p.id !== data.document.id);
        next.unshift(data.document);
        return next;
      });
      setDraft(null);
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!canWrite) return;
    if (!window.confirm(adminText('Delete this operations project and its team assignments?'))) return;
    const res = await fetch(`/api/admin/ops?resource=projects&id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Delete failed');
      return;
    }
    setItems((current) => current.filter((p) => p.id !== id));
    router.refresh();
  }

  return (
    <div className="adm-stack">
      <OpsMetrics items={[{label:'Project portfolio',value:items.length,hint:'All delivery projects'},{label:'Active delivery',value:items.filter(p=>p.status==='active').length,hint:'Projects in progress',tone:'good'},{label:'Past completion date',value:items.filter(p=>projectHealth(p).tone==='danger').length,hint:'Review the delivery baseline',tone:'danger'},{label:'On hold',value:items.filter(p=>p.status==='on_hold').length,hint:'Awaiting a restart decision',tone:'warning'}]}/>
      <TableDataBar
        query={query}
        onQuery={setQuery}
        searchPlaceholder="Search projects…"
        filter={statusFilter}
        onFilter={setStatusFilter}
        filterLabel="All statuses"
        filterOptions={PROJECT_STATUSES}
        columns={tableColumns}
        rows={filtered}
        filename="projects"
        title="Projects"
        canImport={canWrite}
        onImport={importExcel}
        extra={
          <>
            <select aria-label={adminText("Filter client")} value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
              <option value="">{adminText("All clients")}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.nameEn}</option>
              ))}
            </select>
            {canWrite ? <button type="button" className="adm-btn" onClick={() => setDraft({...EMPTY})}>{adminText("New project")}</button> : null}
          </>
        }
      />
      {error && !draft ? <p className="adm-error">{adminText(error)}</p> : null}

      <div className="ops-results"><span>{adminText(filtered.length)}{adminText(" projects · Delivery dates reflect the current baseline")}</span><div className="ops-view-toggle"><button className={view==='table'?'is-active':''} onClick={()=>setView('table')}>{adminText("Register")}</button><button className={view==='cards'?'is-active':''} onClick={()=>setView('cards')}>{adminText("Cards")}</button></div></div>
      {view==='cards' ? <div className="ops-project-cards">{filtered.map(project=>{const health=projectHealth(project);return <article className="ops-project-card" key={project.id}><div className="ops-results"><span>{adminText(project.code)}</span><span className={`ops-pill ${health.tone}`}>{adminText(health.label)}</span></div><h3><Link href={`/admin/ops/projects/${project.id}`}>{project.nameEn}</Link></h3><p>{adminText(clientMap[project.clientId] || 'No client assigned')}</p><div className="ops-progress"><span style={{width:`${project.progress}%`}}/></div><div className="ops-results"><span>{adminText(project.progress)}{adminText("% complete")}</span><span>{adminText(project.status.replaceAll('_',' '))}</span></div><footer><span>{adminText(empMap[project.projectManagerId] || 'Manager unassigned')}</span><span>{adminText(project.plannedEndDate || 'No baseline')}</span></footer></article>})}{!filtered.length&&<OpsEmpty/>}</div> : <div className="adm-card" style={{padding: 0, overflow: 'auto'}}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>{adminText("Project")}</th>
              <th>{adminText("Client")}</th>
              <th>{adminText("PM")}</th>
              <th>{adminText("Status")}</th>
              <th>{adminText("Delivery health")}</th>
              <th>{adminText("Progress")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr key={project.id}>
                <td>
                  <Link href={`/admin/ops/projects/${project.id}`} style={{fontWeight: 600}}>
                    {project.nameEn}
                  </Link>
                  <div style={{fontSize: 12, color: 'var(--cms-muted)'}}>{adminText(project.code)}</div>
                </td>
                <td>{adminText(clientMap[project.clientId] || '—')}</td>
                <td>{adminText(empMap[project.projectManagerId] || '—')}</td>
                <td>
                  <StatusBadge status={project.status}>
                    {PROJECT_STATUSES.find((s) => s.value === project.status)?.label || project.status}
                  </StatusBadge>
                </td>
                <td>
                  <span className={`ops-pill ${projectHealth(project).tone}`}>{adminText(projectHealth(project).label)}</span><div style={{fontSize:11,marginTop:6,color:'var(--cms-muted)'}}>{adminText(project.plannedEndDate || 'No completion date')}</div>
                </td>
                <td>
                  <div className="ops-progress">
                    <span style={{width: `${project.progress || 0}%`}} />
                  </div>
                  <span style={{fontSize: 12}}>{adminText(project.progress || 0)}%</span>
                </td>
                <td style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                  <Link className="adm-btn-ghost" href={`/admin/ops/projects/${project.id}`} style={{display: 'inline-block'}}>{adminText("Open 360")}</Link>
                  {canWrite ? (
                    <button
                      type="button"
                      className="adm-btn-ghost"
                      onClick={() =>
                        setDraft({
                          ...EMPTY,
                          ...project,
                          clientId: project.clientId || '',
                          projectManagerId: project.projectManagerId || '',
                          projectDirectorId: project.projectDirectorId || '',
                          contractValue: project.contractValue ?? '',
                          startDate: project.startDate || '',
                          plannedEndDate: project.plannedEndDate || '',
                          actualEndDate: project.actualEndDate || '',
                        })
                      }
                    >{adminText("Edit")}</button>
                  ) : null}
                  {canWrite ? (
                    <button type="button" className="adm-btn-ghost" onClick={() => onDelete(project.id)}>{adminText("Delete")}</button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan={7} style={{padding: 24, color: 'var(--cms-muted)'}}>{adminText("No delivery projects yet. Create a client first, then add an ops project (separate from Website CMS Portfolio).")}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>}

      {draft ? (
        <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText(draft.id ? 'Edit project' : 'New project')}</h2>
              <AdminCloseButton onClick={() => setDraft(null)} disabled={saving} />
            </div>
            <form onSubmit={onSave}>
              <div className="adm-modal-body">
                {error ? <p className="adm-error">{adminText(error)}</p> : null}
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <label>{adminText("Project name (EN)")}</label>
                    <input
                      required
                      value={draft.nameEn}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, nameEn: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Project name (AR)")}</label>
                    <input
                      dir="rtl"
                      value={draft.nameAr}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, nameAr: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Project code")}</label>
                    <input
                      value={draft.code}
                      disabled={!canWrite}
                      placeholder={adminText("Auto if blank")}
                      onChange={(e) => setDraft({...draft, code: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Client")}</label>
                    <select
                      value={draft.clientId}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, clientId: e.target.value})}
                    >
                      <option value="">—</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Status")}</label>
                    <select
                      value={draft.status}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, status: e.target.value})}
                    >
                      {PROJECT_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {adminText(s.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Priority")}</label>
                    <select
                      value={draft.priority}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, priority: e.target.value})}
                    >
                      {PROJECT_PRIORITIES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {adminText(s.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Project manager")}</label>
                    <select
                      value={draft.projectManagerId}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, projectManagerId: e.target.value})}
                    >
                      <option value="">—</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.fullNameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Project director")}</label>
                    <select
                      value={draft.projectDirectorId}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, projectDirectorId: e.target.value})}
                    >
                      <option value="">—</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.fullNameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Type")}</label>
                    <input
                      value={draft.projectType}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, projectType: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Sector")}</label>
                    <input
                      value={draft.sector}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, sector: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Location")}</label>
                    <input
                      value={draft.location}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, location: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Emirate")}</label>
                    <input
                      value={draft.emirate}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, emirate: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Contract value")}</label>
                    <input
                      type="number"
                      value={draft.contractValue}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, contractValue: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Progress %")}</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={draft.progress}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, progress: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Start date")}</label>
                    <input
                      type="date"
                      value={draft.startDate || ''}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, startDate: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Planned completion")}</label>
                    <input
                      type="date"
                      value={draft.plannedEndDate || ''}
                      disabled={!canWrite}
                      onChange={(e) => setDraft({...draft, plannedEndDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Description (EN)")}</label>
                  <textarea
                    rows={3}
                    value={draft.descriptionEn}
                    disabled={!canWrite}
                    onChange={(e) => setDraft({...draft, descriptionEn: e.target.value})}
                  />
                </div>
              </div>
              {canWrite ? (
                <div className="adm-modal-foot">
                  <button type="submit" className="adm-btn" disabled={saving}>
                    {adminText(saving ? 'Saving…' : 'Save project')}
                  </button>
                </div>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
