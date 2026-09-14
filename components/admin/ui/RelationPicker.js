'use client';

import {useMemo, useState} from 'react';

/**
 * Multi-select searchable checklist.
 * options: [{value, label}]
 * value: array of selected option values
 */
export default function RelationPicker({
  label = 'Relations',
  value = [],
  options = [],
  onChange,
  disabled = false,
  placeholder = 'Search…',
}) {
  const [query, setQuery] = useState('');
  const selected = Array.isArray(value) ? value.map(String) : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      const labelText = String(opt.label || opt.value || '').toLowerCase();
      const valueText = String(opt.value || '').toLowerCase();
      return labelText.includes(q) || valueText.includes(q);
    });
  }, [options, query]);

  function toggle(optionValue) {
    if (disabled) return;
    const next = new Set(selected);
    const key = String(optionValue);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange?.([...next]);
  }

  return (
    <div className="cms-field cms-relation-picker">
      {label ? <label>{label}</label> : null}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label={label ? `${label} search` : 'Search relations'}
      />
      <div className="cms-relation-list" role="group" aria-label={label}>
        {filtered.length === 0 ? (
          <p className="cms-relation-empty">No matches</p>
        ) : (
          filtered.map((opt) => {
            const key = String(opt.value);
            const checked = selected.includes(key);
            return (
              <label key={key} className={`cms-relation-item${checked ? ' is-checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(opt.value)}
                />
                <span>{opt.label || key}</span>
              </label>
            );
          })
        )}
      </div>
      {selected.length > 0 ? (
        <small className="cms-relation-count">{selected.length} selected</small>
      ) : null}
    </div>
  );
}
