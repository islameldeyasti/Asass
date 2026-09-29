'use client';
import {adminText} from '@/lib/admin/translate';


import {useCallback, useEffect, useMemo, useState} from 'react';
import {Columns3, List, MessageSquare} from 'lucide-react';
import TableDataBar from '@/components/admin/ui/TableDataBar';
import EmptyState from '@/components/admin/ui/EmptyState';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import {useToast} from '@/components/admin/ui/ToastProvider';
import {formatAdminDateTime} from '@/lib/admin/locale';

export const ENQUIRY_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'proposal',
  'won',
  'lost',
  'spam',
];

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
  spam: 'Spam',
};

function normalizeStatus(value) {
  const next = String(value || 'new').toLowerCase();
  return ENQUIRY_STATUSES.includes(next) ? next : 'new';
}

function formatDate(value) {
  return formatAdminDateTime(value);
}

export default function EnquiriesBoard({canWrite = false, initialItems = null}) {
  const {toast} = useToast();
  const [items, setItems] = useState(Array.isArray(initialItems) ? initialItems : []);
  const [loading, setLoading] = useState(!Array.isArray(initialItems));
  const [view, setView] = useState('kanban');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content?resource=enquiries', {
        credentials: 'same-origin',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load enquiries');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      toast({
        title: 'Could not load enquiries',
        description: err.message,
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!Array.isArray(initialItems)) load();
  }, [initialItems, load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const status = normalizeStatus(item.status);
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        item.name,
        item.fullName,
        item.email,
        item.phone,
        item.company,
        item.subject,
        item.message,
        item.serviceLabel,
        item.service,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, search, statusFilter]);

  const columns = useMemo(() => {
    const map = Object.fromEntries(ENQUIRY_STATUSES.map((status) => [status, []]));
    for (const item of filtered) {
      map[normalizeStatus(item.status)].push(item);
    }
    return map;
  }, [filtered]);

  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) || null,
    [items, selectedId],
  );

  useEffect(() => {
    if (!selected) {
      setDraft(null);
      setNoteText('');
      return;
    }
    setDraft({
      status: normalizeStatus(selected.status),
      assignedTo: selected.assignedTo || '',
      name: selected.name || selected.fullName || '',
      email: selected.email || '',
      phone: selected.phone || '',
      company: selected.company || '',
      subject: selected.subject || '',
      message: selected.message || '',
    });
    setNoteText('');
  }, [selected]);

  async function persist(patch, {close = false} = {}) {
    if (!canWrite || !patch?.id) return null;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({resource: 'enquiries', item: patch}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      const saved = data.item;
      setItems((current) =>
        current.map((item) => (item.id === saved.id ? saved : item)),
      );
      toast({title: 'Enquiry saved', variant: 'success'});
      if (close) setSelectedId(null);
      return saved;
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err.message,
        variant: 'error',
      });
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function onDropStatus(enquiryId, status) {
    if (!canWrite) return;
    const current = items.find((item) => item.id === enquiryId);
    if (!current || normalizeStatus(current.status) === status) return;
    setItems((list) =>
      list.map((item) => (item.id === enquiryId ? {...item, status} : item)),
    );
    const saved = await persist({id: enquiryId, status});
    if (!saved) {
      setItems((list) =>
        list.map((item) =>
          item.id === enquiryId ? {...item, status: current.status} : item,
        ),
      );
    }
  }

  async function onSaveDrawer(event) {
    event?.preventDefault?.();
    if (!selected || !draft) return;
    const patch = {
      id: selected.id,
      status: normalizeStatus(draft.status),
      assignedTo: draft.assignedTo || null,
    };
    if (noteText.trim()) {
      patch.noteAdd = {text: noteText.trim(), author: 'Admin'};
    }
    const saved = await persist(patch);
    if (saved) setNoteText('');
  }

  function openCard(item) {
    setSelectedId(item.id);
  }

  if (loading) {
    return (
      <div className="cms-card">
        <p style={{margin: 0, color: 'var(--cms-muted)'}}>{adminText("Loading enquiries…")}</p>
      </div>
    );
  }

  return (
    <div className="cms-crm-board">
      <div className="cms-crm-toolbar">
        <TableDataBar
          query={search}
          onQuery={setSearch}
          searchPlaceholder="Search name, email, message…"
          filter={statusFilter === 'all' ? '' : statusFilter}
          onFilter={(value) => setStatusFilter(value || 'all')}
          filterLabel="All statuses"
          filterOptions={ENQUIRY_STATUSES.map((status) => ({value: status, label: STATUS_LABELS[status]}))}
          columns={[
            {key:'name',label:'Name'},
            {key:'email',label:'Email'},
            {key:'phone',label:'Phone'},
            {key:'company',label:'Company'},
            {key:'status',label:'Status'},
            {key:'message',label:'Message'},
          ]}
          rows={filtered}
          filename="enquiries"
          title="Enquiries"
          canImport={canWrite}
          onImport={async (mapped) => {
            for (const row of mapped) {
              const res = await fetch('/api/admin/content', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({resource: 'enquiries', item: row}),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Import failed');
            }
            await load();
          }}
          extra={
            <div className="cms-crm-view-toggle" role="group" aria-label={adminText("View")}>
          <button
            type="button"
            className={view === 'kanban' ? 'is-active' : ''}
            onClick={() => setView('kanban')}
          >
            <Columns3 size={15} aria-hidden />{adminText("Kanban")}</button>
          <button
            type="button"
            className={view === 'table' ? 'is-active' : ''}
            onClick={() => setView('table')}
          >
            <List size={15} aria-hidden />{adminText("Table")}</button>
            </div>
          }
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={adminText("No enquiries")}
          description={
            adminText(items.length === 0
              ? 'New project enquiries will appear here.'
              : 'No enquiries match the current filters.')
          }
        />
      ) : view === 'kanban' ? (
        <div className="cms-kanban">
          {ENQUIRY_STATUSES.map((status) => (
            <section
              key={status}
              className={`cms-kanban-col${dragOverStatus === status ? ' is-drop' : ''}`}
              onDragOver={(e) => {
                if (!canWrite) return;
                e.preventDefault();
                setDragOverStatus(status);
              }}
              onDragLeave={() => setDragOverStatus((current) => (current === status ? null : current))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverStatus(null);
                const id = e.dataTransfer.getData('text/enquiry-id');
                if (id) onDropStatus(id, status);
              }}
            >
              <header className="cms-kanban-col-head">
                <strong>{adminText(STATUS_LABELS[status])}</strong>
                <span>{adminText(columns[status].length)}</span>
              </header>
              <div className="cms-kanban-cards">
                {columns[status].map((item) => (
                  <article
                    key={item.id}
                    className="cms-kanban-card"
                    draggable={canWrite}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/enquiry-id', item.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onClick={() => openCard(item)}
                  >
                    <strong>{item.name || item.fullName || adminText('Untitled')}</strong>
                    <span>{item.email || item.phone || '—'}</span>
                    <p>{adminText(item.subject || item.serviceLabel || item.message || '')}</p>
                    <em>{adminText(formatDate(item.createdAt))}</em>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="cms-card" style={{padding: 0, overflow: 'hidden'}}>
          <table className="cms-table">
            <thead>
              <tr>
                <th>{adminText("Name")}</th>
                <th>{adminText("Email")}</th>
                <th>{adminText("Status")}</th>
                <th>{adminText("Assignee")}</th>
                <th>{adminText("Created")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="cms-crm-row"
                  onClick={() => openCard(item)}
                  style={{cursor: 'pointer'}}
                >
                  <td>
                    <strong>{item.name || item.fullName || '—'}</strong>
                  </td>
                  <td>{item.email || '—'}</td>
                  <td>
                    <StatusBadge status={normalizeStatus(item.status)} />
                  </td>
                  <td>{adminText(item.assignedTo || '—')}</td>
                  <td>{adminText(formatDate(item.createdAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && draft ? (
        <div
          className="cms-drawer-backdrop"
          role="presentation"
          onClick={() => !saving && setSelectedId(null)}
        >
          <aside
            className="cms-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={adminText("Enquiry details")}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cms-drawer-head">
              <div>
                <p className="cms-drawer-kicker">{adminText("Enquiry")}</p>
                <h2>{draft.name || adminText('Contact')}</h2>
              </div>
              <AdminCloseButton onClick={() => setSelectedId(null)} disabled={saving} />
            </header>

            <form className="cms-drawer-body" onSubmit={onSaveDrawer}>
              <div className="cms-grid-2">
                <div className="cms-field">
                  <label>{adminText("Name")}</label>
                  <input value={draft.name} readOnly />
                </div>
                <div className="cms-field">
                  <label>{adminText("Email")}</label>
                  <input value={draft.email} readOnly />
                </div>
                <div className="cms-field">
                  <label>{adminText("Phone")}</label>
                  <input value={draft.phone} readOnly />
                </div>
                <div className="cms-field">
                  <label>{adminText("Company")}</label>
                  <input value={draft.company} readOnly />
                </div>
              </div>

              {draft.subject ? (
                <div className="cms-field">
                  <label>{adminText("Subject")}</label>
                  <input value={draft.subject} readOnly />
                </div>
              ) : null}

              <div className="cms-field">
                <label>{adminText("Message")}</label>
                <textarea value={draft.message} rows={5} readOnly />
              </div>

              <div className="cms-grid-2">
                <div className="cms-field">
                  <label htmlFor="enq-status">{adminText("Status")}</label>
                  <select
                    id="enq-status"
                    value={draft.status}
                    disabled={!canWrite || saving}
                    onChange={(e) =>
                      setDraft((current) => ({...current, status: e.target.value}))
                    }
                  >
                    {ENQUIRY_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {adminText(STATUS_LABELS[status])}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="cms-field">
                  <label htmlFor="enq-assignee">{adminText("Assignee")}</label>
                  <input
                    id="enq-assignee"
                    value={draft.assignedTo}
                    disabled={!canWrite || saving}
                    onChange={(e) =>
                      setDraft((current) => ({...current, assignedTo: e.target.value}))
                    }
                    placeholder={adminText("Name or email")}
                  />
                </div>
              </div>

              <section className="cms-drawer-section">
                <h3>{adminText("Notes")}</h3>
                <ul className="cms-notes-list">
                  {(selected.notes || []).length === 0 ? (
                    <li className="is-empty">{adminText("No notes yet.")}</li>
                  ) : (
                    (selected.notes || []).map((note) => (
                      <li key={note.id || `${note.at}-${note.text}`}>
                        <strong>{adminText(note.author || 'Admin')}</strong>
                        <span>{adminText(formatDate(note.at))}</span>
                        <p>{adminText(note.text)}</p>
                      </li>
                    ))
                  )}
                </ul>
                {canWrite ? (
                  <div className="cms-field">
                    <label htmlFor="enq-note">{adminText("Add note")}</label>
                    <textarea
                      id="enq-note"
                      rows={3}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      disabled={saving}
                      placeholder={adminText("Follow-up details…")}
                    />
                  </div>
                ) : null}
              </section>

              <section className="cms-drawer-section">
                <h3>{adminText("Activity")}</h3>
                <ul className="cms-activity-list">
                  {(selected.activity || []).length === 0 ? (
                    <li className="is-empty">{adminText("No activity yet.")}</li>
                  ) : (
                    (selected.activity || []).map((act) => (
                      <li key={act.id || `${act.at}-${act.text}`}>
                        <StatusBadge status={act.type || 'note'}>{adminText(act.type || 'event')}</StatusBadge>
                        <span>{adminText(act.text)}</span>
                        <em>{adminText(formatDate(act.at))}</em>
                      </li>
                    ))
                  )}
                </ul>
              </section>

              {canWrite ? (
                <div className="cms-drawer-foot">
                  <button type="submit" className="cms-btn" disabled={saving}>
                    {adminText(saving ? 'Saving…' : 'Save')}
                  </button>
                </div>
              ) : null}
            </form>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
