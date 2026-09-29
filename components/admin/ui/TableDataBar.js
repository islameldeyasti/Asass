'use client';

import {useRef, useState} from 'react';
import {FileSpreadsheet, FileText, Search, Upload} from 'lucide-react';
import {adminText} from '@/lib/admin/translate';
import {downloadExcel, downloadPdf, mapImportedRows, parseTableFile} from '@/lib/admin/table-io';

export default function TableDataBar({
  query,
  onQuery,
  searchPlaceholder = 'Search…',
  filter,
  onFilter,
  filterLabel = 'All',
  filterOptions = [],
  columns = [],
  rows = [],
  filename = 'export',
  title = 'Export',
  canImport = false,
  onImport,
  extra = null,
}) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const exportColumns = columns.filter((column) => column.key !== 'password');

  async function exportExcel() {
    setError('');
    setBusy('excel');
    try {
      await downloadExcel(filename, exportColumns, rows);
    } catch (err) {
      setError(err.message || 'Excel export failed');
    } finally {
      setBusy('');
    }
  }

  async function exportPdf() {
    setError('');
    setBusy('pdf');
    try {
      await downloadPdf(filename, title, exportColumns, rows);
    } catch (err) {
      setError(err.message || 'PDF export failed');
    } finally {
      setBusy('');
    }
  }

  async function onFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onImport) return;
    setError('');
    setBusy('import');
    try {
      const raw = await parseTableFile(file);
      const mapped = mapImportedRows(raw, columns).filter((row) =>
        Object.values(row).some((value) => String(value || '').trim()),
      );
      if (!mapped.length) throw new Error('No matching columns found in the file.');
      await onImport(mapped);
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setBusy('');
    }
  }

  return (
    <div className="table-data-bar">
      {onQuery ? (
        <div className="erp-search table-data-search">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={adminText(searchPlaceholder)}
            aria-label={adminText('Search')}
          />
        </div>
      ) : null}
      {onFilter ? (
        <select aria-label={adminText('Filter')} value={filter} onChange={(e) => onFilter(e.target.value)}>
          <option value="">{adminText(filterLabel)}</option>
          {filterOptions.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {adminText(opt.label)}
            </option>
          ))}
        </select>
      ) : null}
      <button type="button" className="erp-btn secondary" disabled={busy === 'excel'} onClick={exportExcel}>
        <FileSpreadsheet size={15} />
        {adminText(busy === 'excel' ? 'Preparing…' : 'Excel')}
      </button>
      <button type="button" className="erp-btn secondary" disabled={busy === 'pdf'} onClick={exportPdf}>
        <FileText size={15} />
        {adminText(busy === 'pdf' ? 'Preparing…' : 'PDF')}
      </button>
      {canImport && onImport ? (
        <>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv,text/csv" hidden onChange={onFile} />
          <button
            type="button"
            className="erp-btn secondary"
            disabled={busy === 'import'}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={15} />
            {adminText(busy === 'import' ? 'Importing…' : 'Import Excel')}
          </button>
        </>
      ) : null}
      {extra}
      {error ? (
        <p className="adm-error" role="alert">
          {adminText(error)}
        </p>
      ) : null}
    </div>
  );
}

export function uniqueFilterOptions(items, key) {
  return [...new Set(items.map((item) => item?.[key]).filter((value) => value != null && value !== ''))]
    .sort()
    .map((value) => ({value, label: String(value)}));
}
