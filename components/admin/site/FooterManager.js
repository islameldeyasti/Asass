'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

export default function FooterManager({initialValue, canWrite = false}) {
  const router = useRouter();
  const [doc, setDoc] = useState(initialValue || {companyLinks: [], cta: {}});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function updateLink(index, patch) {
    setDoc((current) => {
      const companyLinks = [...(current.companyLinks || [])];
      companyLinks[index] = {...companyLinks[index], ...patch};
      return {...current, companyLinks};
    });
  }

  function addLink() {
    setDoc((current) => ({
      ...current,
      companyLinks: [
        ...(current.companyLinks || []),
        {
          id: `link-${Date.now().toString(36)}`,
          labelEn: 'New link',
          labelAr: 'رابط جديد',
          path: '',
          order: ((current.companyLinks || []).length + 1) * 10,
          hidden: false,
        },
      ],
    }));
  }

  function removeLink(index) {
    setDoc((current) => ({
      ...current,
      companyLinks: (current.companyLinks || []).filter((_, i) => i !== index),
    }));
  }

  function moveLink(index, delta) {
    setDoc((current) => {
      const companyLinks = [...(current.companyLinks || [])];
      const target = index + delta;
      if (target < 0 || target >= companyLinks.length) return current;
      const [row] = companyLinks.splice(index, 1);
      companyLinks.splice(target, 0, row);
      return {
        ...current,
        companyLinks: companyLinks.map((link, i) => ({...link, order: (i + 1) * 10})),
      };
    });
  }

  function updateCta(patch) {
    setDoc((current) => ({
      ...current,
      cta: {...(current.cta || {}), ...patch},
    }));
  }

  async function onSave(event) {
    event.preventDefault();
    if (!canWrite) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({resource: 'footer', document: doc}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setDoc(data.document);
      setMessage('Footer saved.');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const links = [...(doc.companyLinks || [])].sort(
    (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
  );

  return (
    <form className="adm-card" onSubmit={onSave}>
      {error ? <p className="adm-error">{error}</p> : null}
      {message ? <p className="adm-success">{message}</p> : null}

      <h2 className="adm-section-title" style={{marginTop: 0}}>
        Company links
      </h2>
      <p className="adm-section-help">
        These links appear in the website footer. Logo is managed in Settings → Branding. Contact
        details come from Settings → Contact.
      </p>

      <div className="adm-link-list">
        {links.map((link, index) => {
          const realIndex = (doc.companyLinks || []).findIndex((row) => row.id === link.id);
          const i = realIndex >= 0 ? realIndex : index;
          return (
            <div key={link.id || index} className="adm-link-row">
              <div className="adm-link-order">
                <button type="button" className="adm-btn-ghost" disabled={!canWrite} onClick={() => moveLink(i, -1)} aria-label="Move up">
                  ↑
                </button>
                <button type="button" className="adm-btn-ghost" disabled={!canWrite} onClick={() => moveLink(i, 1)} aria-label="Move down">
                  ↓
                </button>
              </div>
              <div className="adm-grid-2" style={{flex: 1}}>
                <div className="adm-field" style={{marginBottom: 0}}>
                  <label>Label (English)</label>
                  <input
                    value={link.labelEn || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateLink(i, {labelEn: e.target.value})}
                  />
                </div>
                <div className="adm-field" style={{marginBottom: 0}}>
                  <label>Label (Arabic)</label>
                  <input
                    dir="rtl"
                    value={link.labelAr || ''}
                    disabled={!canWrite}
                    onChange={(e) => updateLink(i, {labelAr: e.target.value})}
                  />
                </div>
                <div className="adm-field" style={{marginBottom: 0}}>
                  <label>Page</label>
                  <input
                    value={link.path || ''}
                    disabled={!canWrite}
                    placeholder="about"
                    onChange={(e) => updateLink(i, {path: e.target.value})}
                  />
                </div>
                <div className="adm-field" style={{marginBottom: 0, display: 'flex', alignItems: 'end'}}>
                  <label className="adm-switch">
                    <input
                      type="checkbox"
                      checked={!link.hidden}
                      disabled={!canWrite}
                      onChange={(e) => updateLink(i, {hidden: !e.target.checked})}
                    />
                    <span className="adm-switch-track" aria-hidden />
                    <span>{link.hidden ? 'Hidden' : 'Visible'}</span>
                  </label>
                </div>
              </div>
              {canWrite ? (
                <button type="button" className="adm-btn-danger" onClick={() => removeLink(i)}>
                  Remove
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {canWrite ? (
        <button type="button" className="adm-btn-ghost" style={{marginTop: 12}} onClick={addLink}>
          Add link
        </button>
      ) : null}

      <h2 className="adm-section-title">Call-to-action band</h2>
      <p className="adm-section-help">Optional. Leave blank to keep the default website wording.</p>
      <div className="adm-grid-2">
        <div className="adm-field">
          <label>Eyebrow (English)</label>
          <input
            value={doc.cta?.eyebrowEn || ''}
            disabled={!canWrite}
            onChange={(e) => updateCta({eyebrowEn: e.target.value})}
          />
        </div>
        <div className="adm-field">
          <label>Eyebrow (Arabic)</label>
          <input
            dir="rtl"
            value={doc.cta?.eyebrowAr || ''}
            disabled={!canWrite}
            onChange={(e) => updateCta({eyebrowAr: e.target.value})}
          />
        </div>
        <div className="adm-field">
          <label>Title (English)</label>
          <input
            value={doc.cta?.titleEn || ''}
            disabled={!canWrite}
            onChange={(e) => updateCta({titleEn: e.target.value})}
          />
        </div>
        <div className="adm-field">
          <label>Title (Arabic)</label>
          <input
            dir="rtl"
            value={doc.cta?.titleAr || ''}
            disabled={!canWrite}
            onChange={(e) => updateCta({titleAr: e.target.value})}
          />
        </div>
      </div>
      <div className="adm-field">
        <label>Button page</label>
        <input
          value={doc.cta?.href || ''}
          disabled={!canWrite}
          placeholder="project-enquiry"
          onChange={(e) => updateCta({href: e.target.value})}
        />
      </div>

      {canWrite ? (
        <div style={{marginTop: 16}}>
          <button type="submit" className="adm-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save footer'}
          </button>
        </div>
      ) : (
        <p className="adm-section-help" style={{marginTop: 16}}>
          Read-only for your role.
        </p>
      )}
    </form>
  );
}
