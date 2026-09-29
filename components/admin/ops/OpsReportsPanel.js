'use client';
import {adminText} from '@/lib/admin/translate';


import {useState} from 'react';

export default function OpsReportsPanel({types = [], canHr = false}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [preview, setPreview] = useState(null);

  const visible = types.filter((t) => canHr || !t.needsHr);

  async function previewReport(type) {
    setBusy(type);
    setError('');
    try {
      const res = await fetch(`/api/admin/ops?resource=report&type=${encodeURIComponent(type)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed');
      setPreview(body);
    } catch (err) {
      setError(err.message || 'Failed');
    } finally {
      setBusy('');
    }
  }

  function downloadCsv(type) {
    window.location.href = `/api/admin/ops?resource=report&type=${encodeURIComponent(type)}&format=csv`;
  }

  return (
    <div className="adm-stack">
      {error ? <p className="adm-error">{adminText(error)}</p> : null}
      <div className="adm-grid-2">
        {visible.map((report) => (
          <section key={report.value} className="adm-card">
            <h2 className="adm-section-title" style={{marginTop: 0}}>
              {adminText(report.label)}
            </h2>
            <p className="adm-section-help">
              {adminText(report.needsHr ? 'HR-scoped export' : 'Operations export')}{adminText(" · CSV download")}</p>
            <div className="cms-report-actions">
              <button
                type="button"
                className="adm-btn-ghost"
                disabled={busy === report.value}
                onClick={() => previewReport(report.value)}
              >
                {busy === report.value ? adminText('Loading…') : adminText('Preview')}
              </button>
              <button type="button" className="adm-btn" onClick={() => downloadCsv(report.value)}>{adminText("Download CSV")}</button>
            </div>
          </section>
        ))}
      </div>

      {preview ? (
        <section className="adm-card">
          <h2 className="adm-section-title" style={{marginTop: 0}}>{adminText("Preview · ")}{preview.filename}
          </h2>
          <p className="adm-section-help">{adminText(preview.count)}{adminText(" rows")}</p>
          <pre
            style={{
              margin: 0,
              padding: 12,
              overflow: 'auto',
              background: 'var(--cms-surface-2, #f4f4f5)',
              fontSize: 12,
              borderRadius: 8,
            }}
          >
            {preview.preview}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
