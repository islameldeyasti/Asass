'use client';

import {useMemo, useState} from 'react';
import TableDataBar, {uniqueFilterOptions} from '@/components/admin/ui/TableDataBar';
import {adminText} from '@/lib/admin/translate';

export default function ClientDataTable({
  columns,
  rows,
  filename,
  title,
  filterKey,
  searchKeys,
  renderCell,
  canImport = false,
  onImport,
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const keys = searchKeys || columns.map((c) => c.key);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filterKey && filter && String(row[filterKey] || '') !== String(filter)) return false;
      if (!q) return true;
      return keys.some((key) => String(row[key] ?? '').toLowerCase().includes(q));
    });
  }, [rows, query, filter, filterKey, keys]);

  return (
    <div className="erp-register">
      <TableDataBar
        query={query}
        onQuery={setQuery}
        filter={filterKey ? filter : undefined}
        onFilter={filterKey ? setFilter : undefined}
        filterOptions={filterKey ? uniqueFilterOptions(rows, filterKey) : []}
        columns={columns}
        rows={visible}
        filename={filename}
        title={title}
        canImport={canImport}
        onImport={onImport}
      />
      <div className="erp-table-scroll cms-table-wrap">
        <table className="erp-table adm-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{adminText(col.label)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => (
              <tr key={row.id || index}>
                {columns.map((col) => (
                  <td key={col.key}>{renderCell ? renderCell(row, col) : adminText(row[col.key] ?? '—')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
