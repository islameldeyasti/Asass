'use client';
import {adminText} from '@/lib/admin/translate';


import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {formatAdminDateTime} from '@/lib/admin/locale';

export default function ProjectCommentsPanel({
  projectId,
  comments: initialThreads = [],
  employees = [],
  canWrite = false,
  onChanged,
}) {
  const router = useRouter();
  const [threads, setThreads] = useState(initialThreads);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  const empMap = Object.fromEntries(employees.map((e) => [e.id, e.fullNameEn]));

  async function refreshList() {
    const res = await fetch(
      `/api/admin/ops?resource=comments&projectId=${encodeURIComponent(projectId)}`,
    );
    const data = await res.json();
    if (res.ok) setThreads(data.threads || []);
    onChanged?.();
    router.refresh();
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canWrite || !body.trim()) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          resource: 'comments',
          document: {
            projectId,
            subjectType: 'project',
            subjectId: projectId,
            parentId: replyTo || null,
            body: body.trim(),
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setBody('');
      setReplyTo(null);
      await refreshList();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!canWrite) return;
    if (!window.confirm(adminText('Delete this comment and its replies?'))) return;
    const res = await fetch(
      `/api/admin/ops?resource=comments&id=${encodeURIComponent(id)}`,
      {method: 'DELETE'},
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Delete failed');
      return;
    }
    await refreshList();
  }

  return (
    <div className="adm-stack">
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      {canWrite ? (
        <form className="adm-card" onSubmit={onSubmit}>
          <h3 className="adm-section-title" style={{marginTop: 0}}>
            {adminText(replyTo ? 'Reply' : 'New comment')}
          </h3>
          {replyTo ? (
            <p className="adm-section-help">{adminText("Replying to a thread.")}{adminText(' ')}
              <button type="button" className="adm-btn-ghost" onClick={() => setReplyTo(null)}>{adminText("Cancel reply")}</button>
            </p>
          ) : null}
          <div className="adm-field">
            <label>{adminText("Message")}</label>
            <textarea
              rows={3}
              required
              placeholder={adminText("Use @name to mention someone")}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <button type="submit" className="adm-btn" disabled={saving}>
            {adminText(saving ? 'Posting…' : 'Post')}
          </button>
        </form>
      ) : null}

      <div className="adm-stack">
        {threads.map((thread) => (
          <section key={thread.id} className="adm-card">
            <div style={{display: 'flex', justifyContent: 'space-between', gap: 8}}>
              <div>
                <strong>{adminText(empMap[thread.authorEmployeeId] || 'User')}</strong>
                <span style={{fontSize: 12, color: 'var(--cms-muted)', marginLeft: 8}}>
                  {thread.createdAt ? formatAdminDateTime(thread.createdAt) : ''}
                </span>
              </div>
              {canWrite ? (
                <div>
                  <button type="button" className="adm-btn-ghost" onClick={() => setReplyTo(thread.id)}>{adminText("Reply")}</button>
                  <button type="button" className="adm-btn-ghost" onClick={() => onDelete(thread.id)}>{adminText("Delete")}</button>
                </div>
              ) : null}
            </div>
            <p style={{whiteSpace: 'pre-wrap', marginBottom: 0}}>{adminText(thread.body)}</p>
            {(thread.replies || []).length ? (
              <div style={{marginTop: 12, paddingLeft: 16, borderLeft: '2px solid var(--cms-border)'}}>
                {thread.replies.map((reply) => (
                  <div key={reply.id} style={{marginBottom: 10}}>
                    <strong>{adminText(empMap[reply.authorEmployeeId] || 'User')}</strong>
                    <span style={{fontSize: 12, color: 'var(--cms-muted)', marginLeft: 8}}>
                      {reply.createdAt ? formatAdminDateTime(reply.createdAt) : ''}
                    </span>
                    <p style={{whiteSpace: 'pre-wrap', margin: '4px 0 0'}}>{adminText(reply.body)}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ))}
        {!threads.length ? (
          <div className="adm-card">
            <p className="adm-section-help" style={{margin: 0}}>{adminText("No project communication yet. Thread comments and @mentions live here.")}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
