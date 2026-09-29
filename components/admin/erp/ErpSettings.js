'use client';
import {adminText} from '@/lib/admin/translate';
import {useState} from 'react';
import SettingsLayout from '@/components/admin/ui/SettingsLayout';

const NAV = [
  {id: 'company', label: 'Company'},
  {id: 'tax', label: 'Tax'},
  {id: 'accounting', label: 'Accounting'},
  {id: 'backup', label: 'Backup'},
];

export default function ErpSettings({initialSettings}) {
  const [draft, setDraft] = useState(initialSettings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function setField(key, value) {
    setDraft((current) => ({...current, [key]: value}));
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/admin/erp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({module: 'settings', document: draft}),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setDraft(body.settings);
      setMessage('Company settings saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SettingsLayout items={NAV} active="company">
      <form className="kt-settings-stack" onSubmit={save}>
        {error ? (
          <div role="alert" className="erp-error">
            {adminText(error)}
          </div>
        ) : null}
        {message ? (
          <div role="status" className="erp-notice">
            {adminText(message)}
          </div>
        ) : null}

        <section id="company" className="kt-card">
          <header className="kt-card-head">
            <div>
              <h2>{adminText('Company configuration')}</h2>
              <p>
                {adminText(
                  'Set company details and your applicable tax rate before issuing documents. The default tax rate is 0% until configured. This setting does not determine tax eligibility.',
                )}
              </p>
            </div>
          </header>
          <div className="kt-card-body">
            <div className="erp-form-grid">
              <label className="erp-field">
                <span>{adminText('Legal company name')} *</span>
                <input
                  type="text"
                  required
                  value={draft.companyName}
                  onChange={(e) => setField('companyName', e.target.value)}
                />
              </label>
              <label className="erp-field full">
                <span>{adminText('Registered address')}</span>
                <textarea
                  rows={3}
                  value={draft.address}
                  onChange={(e) => setField('address', e.target.value)}
                />
              </label>
            </div>
          </div>
        </section>

        <section id="tax" className="kt-card">
          <header className="kt-card-head">
            <div>
              <h2>{adminText('Tax')}</h2>
              <p>{adminText('Registration details applied to invoices and bills.')}</p>
            </div>
          </header>
          <div className="kt-card-body">
            <div className="erp-form-grid">
              <label className="erp-field">
                <span>{adminText('Tax registration number')}</span>
                <input
                  type="text"
                  value={draft.taxNumber}
                  onChange={(e) => setField('taxNumber', e.target.value)}
                />
              </label>
              <label className="erp-field">
                <span>{adminText('Default line tax rate %')}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={draft.defaultTaxRate}
                  onChange={(e) => setField('defaultTaxRate', e.target.value)}
                />
              </label>
            </div>
          </div>
        </section>

        <section id="accounting" className="kt-card">
          <header className="kt-card-head">
            <div>
              <h2>{adminText('Accounting periods')}</h2>
              <p>
                {adminText(
                  'Closing a period blocks new postings and reversals on or before that date. Closed dates can only move forward. Base currency is fixed after the first document.',
                )}
              </p>
            </div>
          </header>
          <div className="kt-card-body">
            <div className="erp-form-grid">
              <label className="erp-field">
                <span>{adminText('Base currency')} *</span>
                <input
                  type="text"
                  required
                  value={draft.currency}
                  onChange={(e) => setField('currency', e.target.value)}
                />
              </label>
              <label className="erp-field">
                <span>{adminText('Accounting closed through')}</span>
                <input
                  type="date"
                  value={draft.closedThrough}
                  onChange={(e) => setField('closedThrough', e.target.value)}
                />
              </label>
            </div>
          </div>
          <footer className="kt-card-foot">
            <button className={`erp-btn${busy ? ' is-loading' : ''}`} disabled={busy}>
              {adminText(busy ? 'Saving…' : 'Save settings')}
            </button>
          </footer>
        </section>
      </form>

      <section id="backup" className="kt-card">
        <header className="kt-card-head">
          <div>
            <h2>{adminText('Database backup')}</h2>
            <p>
              {adminText(
                'Download a consistent backup of ERP records, ledger entries and audit history. Keep it in a protected location.',
              )}
            </p>
          </div>
        </header>
        <footer className="kt-card-foot">
          <a download className="erp-btn secondary" href="/api/admin/erp?module=backup">
            {adminText('Download backup')}
          </a>
        </footer>
      </section>
    </SettingsLayout>
  );
}
