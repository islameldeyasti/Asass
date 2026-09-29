'use client';
import {adminText} from '@/lib/admin/translate';


import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import MediaPicker from '@/components/admin/media/MediaPicker';

const EMPTY = {
  title: '',
  date: '',
  time: '',
  location: '',
  onlineLink: '',
  organizerEmployeeId: '',
  attendeeIds: [],
  agenda: '',
  minutes: '',
  attachmentUrl: '',
  actionsText: '',
};

export default function ProjectMeetingsPanel({
  projectId,
  meetings: initialMeetings = [],
  employees = [],
  canWrite = false,
  onChanged,
}) {
  const router = useRouter();
  const [meetings, setMeetings] = useState(initialMeetings);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMeetings(initialMeetings);
  }, [initialMeetings]);

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn]));

  async function refreshList() {
    const res = await fetch(
      `/api/admin/ops?resource=meetings&projectId=${encodeURIComponent(projectId)}`,
    );
    const body = await res.json();
    if (res.ok) setMeetings(body.items || []);
    onChanged?.();
    router.refresh();
  }

  function parseActions(text) {
    return String(text || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [body, assigneeEmployeeId, dueDate] = line.split('|').map((p) => p.trim());
        return {
          text: body,
          assigneeEmployeeId: assigneeEmployeeId || null,
          dueDate: dueDate || null,
        };
      });
  }

  async function onSave(event) {
    event.preventDefault();
    if (!canWrite || !draft) return;
    setSaving(true);
    setError('');
    try {
      const existing = draft.actions || [];
      const added = parseActions(draft.actionsText);
      const actions = draft.id ? [...existing, ...added] : added;
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          resource: 'meetings',
          document: {
            id: draft.id || undefined,
            title: draft.title,
            projectId,
            date: draft.date || null,
            time: draft.time || '',
            location: draft.location || '',
            onlineLink: draft.onlineLink || '',
            organizerEmployeeId: draft.organizerEmployeeId || null,
            attendeeIds: draft.attendeeIds || [],
            agenda: draft.agenda || '',
            minutes: draft.minutes || '',
            attachmentUrl: draft.attachmentUrl || '',
            actions,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDraft(null);
      await refreshList();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function createTasks(meetingId) {
    if (!canWrite) return;
    if (!window.confirm(adminText('Create tasks from open action items?'))) return;
    setError('');
    const res = await fetch('/api/admin/ops', {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({resource: 'meeting-tasks', document: {meetingId}}),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Could not create tasks');
      return;
    }
    await refreshList();
  }

  async function onDelete(id) {
    if (!canWrite) return;
    if (!window.confirm(adminText('Delete this meeting?'))) return;
    const res = await fetch(
      `/api/admin/ops?resource=meetings&id=${encodeURIComponent(id)}`,
      {method: 'DELETE'},
    );
    const body = await res.json();
    if (!res.ok) {
      setError(body.error || 'Delete failed');
      return;
    }
    await refreshList();
  }

  function toggleAttendee(id) {
    const current = new Set(draft.attendeeIds || []);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    setDraft({...draft, attendeeIds: [...current]});
  }

  return (
    <div className="adm-stack">
      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        {canWrite ? (
          <button type="button" className="adm-btn" onClick={() => setDraft({...EMPTY})}>{adminText("New meeting")}</button>
        ) : null}
      </div>
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      <div className="adm-stack">
        {meetings.map((meeting) => {
          const openActions = (meeting.actions || []).filter((a) => !a.taskId);
          return (
            <section key={meeting.id} className="adm-card">
              <div style={{display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap'}}>
                <div>
                  <h3 className="adm-section-title" style={{marginTop: 0, marginBottom: 4}}>
                    {adminText(meeting.title)}
                  </h3>
                  <p className="adm-section-help" style={{margin: 0}}>
                    {adminText([meeting.date, meeting.time, meeting.location].filter(Boolean).join(' · ') ||
                      'Schedule TBD')}
                    {meeting.onlineLink ? (
                      <>
                        {adminText(' · ')}
                        <a href={meeting.onlineLink} target="_blank" rel="noreferrer">{adminText("Join link")}</a>
                      </>
                    ) : null}
                  </p>
                </div>
                <div>
                  {canWrite && openActions.length ? (
                    <button
                      type="button"
                      className="adm-btn-ghost"
                      onClick={() => createTasks(meeting.id)}
                    >{adminText("Create ")}{adminText(openActions.length)}{adminText(" task")}{adminText(openActions.length === 1 ? '' : 's')}
                    </button>
                  ) : null}
                  {canWrite ? (
                    <>
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() =>
                          setDraft({
                            ...EMPTY,
                            ...meeting,
                            organizerEmployeeId: meeting.organizerEmployeeId || '',
                            attendeeIds: meeting.attendeeIds || [],
                            actionsText: '',
                          })
                        }
                      >{adminText("Edit")}</button>
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() => onDelete(meeting.id)}
                      >{adminText("Delete")}</button>
                    </>
                  ) : null}
                </div>
              </div>
              {meeting.agenda ? (
                <p style={{marginTop: 12, whiteSpace: 'pre-wrap'}}>
                  <strong>{adminText("Agenda:")}</strong> {adminText(meeting.agenda)}
                </p>
              ) : null}
              {meeting.minutes ? (
                <p style={{whiteSpace: 'pre-wrap'}}>
                  <strong>{adminText("Minutes:")}</strong> {adminText(meeting.minutes)}
                </p>
              ) : null}
              {(meeting.actions || []).length ? (
                <ul className="ops-360-list" style={{marginTop: 12}}>
                  {meeting.actions.map((action) => (
                    <li key={action.id}>
                      {adminText(action.text)}
                      {adminText(action.assigneeEmployeeId
                        ? ` · ${empMap[action.assigneeEmployeeId] || 'Assignee'}`
                        : '')}
                      {adminText(action.dueDate ? ` · due ${action.dueDate}` : '')}
                      {adminText(action.taskId ? ' · linked task' : '')}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
        {!meetings.length ? (
          <div className="adm-card">
            <p className="adm-section-help" style={{margin: 0}}>{adminText("No meetings logged. Capture agenda, minutes, and action items that become tasks.")}</p>
          </div>
        ) : null}
      </div>

      {draft ? (
        <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText(draft.id ? 'Edit meeting' : 'New meeting')}</h2>
              <AdminCloseButton onClick={() => setDraft(null)} disabled={saving} />
            </div>
            <form onSubmit={onSave}>
              <div className="adm-modal-body">
                <div className="adm-field">
                  <label>{adminText("Title")}</label>
                  <input
                    required
                    value={draft.title}
                    onChange={(e) => setDraft({...draft, title: e.target.value})}
                  />
                </div>
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <label>{adminText("Date")}</label>
                    <input
                      type="date"
                      value={draft.date || ''}
                      onChange={(e) => setDraft({...draft, date: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Time")}</label>
                    <input
                      value={draft.time}
                      placeholder={adminText("10:00")}
                      onChange={(e) => setDraft({...draft, time: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Location")}</label>
                    <input
                      value={draft.location}
                      onChange={(e) => setDraft({...draft, location: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Online link")}</label>
                    <input
                      value={draft.onlineLink}
                      onChange={(e) => setDraft({...draft, onlineLink: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Organizer")}</label>
                    <select
                      value={draft.organizerEmployeeId}
                      onChange={(e) => setDraft({...draft, organizerEmployeeId: e.target.value})}
                    >
                      <option value="">—</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.fullNameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Attendees")}</label>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
                    {employees.map((e) => (
                      <label key={e.id} style={{fontSize: 13}}>
                        <input
                          type="checkbox"
                          checked={(draft.attendeeIds || []).includes(e.id)}
                          onChange={() => toggleAttendee(e.id)}
                        />{adminText(' ')}
                        {e.fullNameEn}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Agenda")}</label>
                  <textarea
                    rows={3}
                    value={draft.agenda}
                    onChange={(e) => setDraft({...draft, agenda: e.target.value})}
                  />
                </div>
                <div className="adm-field">
                  <label>{adminText("Minutes")}</label>
                  <textarea
                    rows={3}
                    value={draft.minutes}
                    onChange={(e) => setDraft({...draft, minutes: e.target.value})}
                  />
                </div>
                <MediaPicker
                  label={adminText("Attachment")}
                  value={draft.attachmentUrl}
                  onChange={(url) => setDraft({...draft, attachmentUrl: url})}
                  mode="DOCUMENT"
                  canWrite={canWrite}
                  enableCrop={false}
                  enableFocal={false}
                />
                {draft.id && (draft.actions || []).length ? (
                  <div className="adm-field">
                    <label>{adminText("Existing actions")}</label>
                    <ul className="ops-360-list">
                      {draft.actions.map((a) => (
                        <li key={a.id}>
                          {adminText(a.text)}
                          {adminText(a.taskId ? ' (task linked)' : '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <div className="adm-field">
                  <label>
                    {adminText(draft.id ? 'Add action items' : 'Action items')}{adminText(" (one per line: text | employeeId | dueDate)")}</label>
                  <textarea
                    rows={3}
                    placeholder={adminText('Send revised BOQ | emp_xxx | 2026-10-01')}
                    value={draft.actionsText}
                    onChange={(e) => setDraft({...draft, actionsText: e.target.value})}
                  />
                </div>
              </div>
              <div className="adm-modal-foot">
                <button type="submit" className="adm-btn" disabled={saving}>
                  {adminText(saving ? 'Saving…' : 'Save meeting')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
