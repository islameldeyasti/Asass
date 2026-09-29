'use client';
import {adminText} from '@/lib/admin/translate';


import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import AdminCloseButton from '@/components/admin/ui/AdminCloseButton';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import MediaPicker from '@/components/admin/media/MediaPicker';
import {DOCUMENT_CONFIDENTIALITY, DOCUMENT_STATUSES} from '@/lib/ops/constants';

const EMPTY = {
  name: '',
  type: '',
  description: '',
  status: 'draft',
  confidentiality: 'internal',
  stageId: '',
  fileUrl: '',
  fileName: '',
  notes: '',
};

export default function ProjectDocumentsPanel({
  projectId,
  documents: initialDocuments = [],
  stages = [],
  canWrite = false,
  onChanged,
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [draft, setDraft] = useState(null);
  const [revisionFor, setRevisionFor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  async function refreshList() {
    const res = await fetch(
      `/api/admin/ops?resource=documents&projectId=${encodeURIComponent(projectId)}`,
    );
    const body = await res.json();
    if (res.ok) setDocuments(body.items || []);
    onChanged?.();
    router.refresh();
  }

  async function onSave(event) {
    event.preventDefault();
    if (!canWrite || !draft) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...draft,
        projectId,
        stageId: draft.stageId || null,
      };
      if (!draft.id && draft.fileUrl) {
        payload.versions = [
          {
            fileUrl: draft.fileUrl,
            fileName: draft.fileName || draft.name,
            notes: draft.notes || '',
            revision: 'REV 01',
            version: 1,
            isLatest: true,
          },
        ];
      }
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({resource: 'documents', document: payload}),
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

  async function onAddRevision(event) {
    event.preventDefault();
    if (!canWrite || !revisionFor?.id || !revisionFor.fileUrl) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/ops', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          resource: 'document-revision',
          document: {
            documentId: revisionFor.id,
            fileUrl: revisionFor.fileUrl,
            fileName: revisionFor.fileName || '',
            notes: revisionFor.notes || '',
            revision: revisionFor.revision || '',
            status: revisionFor.status || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Revision failed');
      setRevisionFor(null);
      await refreshList();
    } catch (err) {
      setError(err.message || 'Revision failed');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!canWrite) return;
    if (!window.confirm(adminText('Delete this document and all revisions?'))) return;
    const res = await fetch(
      `/api/admin/ops?resource=documents&id=${encodeURIComponent(id)}`,
      {method: 'DELETE'},
    );
    const body = await res.json();
    if (!res.ok) {
      setError(body.error || 'Delete failed');
      return;
    }
    await refreshList();
  }

  return (
    <div className="adm-stack">
      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        {canWrite ? (
          <button type="button" className="adm-btn" onClick={() => setDraft({...EMPTY})}>{adminText("New document")}</button>
        ) : null}
      </div>
      {error ? <p className="adm-error">{adminText(error)}</p> : null}

      <div className="adm-card" style={{padding: 0, overflow: 'auto'}}>
        <table className="adm-table">
          <thead>
            <tr>
              <th>{adminText("Document")}</th>
              <th>{adminText("Revision")}</th>
              <th>{adminText("Status")}</th>
              <th>{adminText("Confidentiality")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <strong>{doc.name}</strong>
                  <div style={{fontSize: 12, color: 'var(--cms-muted)'}}>
                    {adminText(doc.type || '—')}
                    {doc.latestFileUrl ? (
                      <>
                        {adminText(' · ')}
                        <a href={doc.latestFileUrl} target="_blank" rel="noreferrer">{adminText("Open file")}</a>
                      </>
                    ) : null}
                  </div>
                </td>
                <td>{adminText(doc.latestRevision || '—')}</td>
                <td>
                  <StatusBadge status={doc.status}>
                    {DOCUMENT_STATUSES.find((s) => s.value === doc.status)?.label || doc.status}
                  </StatusBadge>
                </td>
                <td>
                  {DOCUMENT_CONFIDENTIALITY.find((s) => s.value === doc.confidentiality)?.label ||
                    doc.confidentiality}
                </td>
                <td style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                  {canWrite ? (
                    <>
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() =>
                          setDraft({
                            ...EMPTY,
                            ...doc,
                            stageId: doc.stageId || '',
                            fileUrl: '',
                            fileName: '',
                            notes: '',
                          })
                        }
                      >{adminText("Edit")}</button>
                      <button
                        type="button"
                        className="adm-btn-ghost"
                        onClick={() =>
                          setRevisionFor({
                            id: doc.id,
                            fileUrl: '',
                            fileName: '',
                            notes: '',
                            revision: '',
                            status: doc.status,
                          })
                        }
                      >{adminText("New rev")}</button>
                      <button type="button" className="adm-btn-ghost" onClick={() => onDelete(doc.id)}>{adminText("Delete")}</button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
            {!documents.length ? (
              <tr>
                <td colSpan={5} style={{padding: 24, color: 'var(--cms-muted)'}}>{adminText("No project documents yet. Upload files with revision history (never overwrite).")}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {draft ? (
        <div className="adm-modal-backdrop" role="presentation" onClick={() => !saving && setDraft(null)}>
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText(draft.id ? 'Edit document' : 'New document')}</h2>
              <AdminCloseButton onClick={() => setDraft(null)} disabled={saving} />
            </div>
            <form onSubmit={onSave}>
              <div className="adm-modal-body">
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <label>{adminText("Name")}</label>
                    <input
                      required
                      value={draft.name}
                      onChange={(e) => setDraft({...draft, name: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Type")}</label>
                    <input
                      value={draft.type}
                      placeholder={adminText("Drawing, Spec, Report…")}
                      onChange={(e) => setDraft({...draft, type: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Status")}</label>
                    <select
                      value={draft.status}
                      onChange={(e) => setDraft({...draft, status: e.target.value})}
                    >
                      {DOCUMENT_STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {adminText(s.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Confidentiality")}</label>
                    <select
                      value={draft.confidentiality}
                      onChange={(e) => setDraft({...draft, confidentiality: e.target.value})}
                    >
                      {DOCUMENT_CONFIDENTIALITY.map((s) => (
                        <option key={s.value} value={s.value}>
                          {adminText(s.label)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Stage")}</label>
                    <select
                      value={draft.stageId}
                      onChange={(e) => setDraft({...draft, stageId: e.target.value})}
                    >
                      <option value="">—</option>
                      {stages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Description")}</label>
                  <textarea
                    rows={2}
                    value={draft.description}
                    onChange={(e) => setDraft({...draft, description: e.target.value})}
                  />
                </div>
                {!draft.id ? (
                  <>
                    <MediaPicker
                      label={adminText("Initial file")}
                      value={draft.fileUrl}
                      onChange={(url) => setDraft({...draft, fileUrl: url})}
                      mode="DOCUMENT"
                      canWrite={canWrite}
                      enableCrop={false}
                      enableFocal={false}
                    />
                    <div className="adm-field">
                      <label>{adminText("File name")}</label>
                      <input
                        value={draft.fileName}
                        onChange={(e) => setDraft({...draft, fileName: e.target.value})}
                      />
                    </div>
                  </>
                ) : draft.versions?.length ? (
                  <div className="adm-field">
                    <label>{adminText("Revision history")}</label>
                    <ul className="ops-360-list">
                      {[...draft.versions].reverse().map((v) => (
                        <li key={v.id}>
                          <strong>{adminText(v.revision)}</strong>
                          {v.fileUrl ? (
                            <>
                              {adminText(' · ')}
                              <a href={v.fileUrl} target="_blank" rel="noreferrer">
                                {adminText(v.fileName || 'file')}
                              </a>
                            </>
                          ) : null}
                          {v.notes ? ` — ${v.notes}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              <div className="adm-modal-foot">
                <button type="submit" className="adm-btn" disabled={saving}>
                  {adminText(saving ? 'Saving…' : 'Save document')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {revisionFor ? (
        <div
          className="adm-modal-backdrop"
          role="presentation"
          onClick={() => !saving && setRevisionFor(null)}
        >
          <div className="adm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="adm-modal-head">
              <h2>{adminText("Add revision")}</h2>
              <AdminCloseButton onClick={() => setRevisionFor(null)} disabled={saving} />
            </div>
            <form onSubmit={onAddRevision}>
              <div className="adm-modal-body">
                <p className="adm-section-help" style={{marginTop: 0}}>{adminText("Previous revisions are kept. New upload becomes the latest REV.")}</p>
                <MediaPicker
                  label={adminText("New file")}
                  value={revisionFor.fileUrl}
                  onChange={(url) => setRevisionFor({...revisionFor, fileUrl: url})}
                  mode="DOCUMENT"
                  canWrite={canWrite}
                  enableCrop={false}
                  enableFocal={false}
                />
                <div className="adm-grid-2">
                  <div className="adm-field">
                    <label>{adminText("File name")}</label>
                    <input
                      value={revisionFor.fileName}
                      onChange={(e) => setRevisionFor({...revisionFor, fileName: e.target.value})}
                    />
                  </div>
                  <div className="adm-field">
                    <label>{adminText("Revision label (optional)")}</label>
                    <input
                      placeholder={adminText("Auto REV 0N")}
                      value={revisionFor.revision}
                      onChange={(e) => setRevisionFor({...revisionFor, revision: e.target.value})}
                    />
                  </div>
                </div>
                <div className="adm-field">
                  <label>{adminText("Notes")}</label>
                  <textarea
                    rows={2}
                    value={revisionFor.notes}
                    onChange={(e) => setRevisionFor({...revisionFor, notes: e.target.value})}
                  />
                </div>
              </div>
              <div className="adm-modal-foot">
                <button type="submit" className="adm-btn" disabled={saving || !revisionFor.fileUrl}>
                  {adminText(saving ? 'Saving…' : 'Add revision')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
