'use client';

import {useMemo, useState} from 'react';

function isFilled(value) {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

function fieldsComplete(fields = [], values = {}) {
  if (!fields.length) return true;
  return fields.every((field) => {
    const key = typeof field === 'string' ? field : field.key;
    if (!key) return true;
    if (values[`__text_${key}`] != null) return isFilled(values[`__text_${key}`]);
    return isFilled(values[key]);
  });
}

/**
 * Bilingual editor tabs.
 * Use either:
 * - children render prop: ({tab, enComplete, arComplete}) => node
 * - enFields / arFields (+ optional generalFields) with renderField(field)
 */
export default function TranslationTabs({
  children,
  enFields = [],
  arFields = [],
  generalFields = [],
  values = {},
  renderField,
  defaultTab = 'en',
}) {
  const hasGeneral = generalFields.length > 0 || (typeof children !== 'function' && false);
  const showGeneral = generalFields.length > 0;
  const [tab, setTab] = useState(defaultTab === 'ar' ? 'ar' : defaultTab === 'general' ? 'general' : 'en');

  const enComplete = useMemo(() => fieldsComplete(enFields, values), [enFields, values]);
  const arComplete = useMemo(() => fieldsComplete(arFields, values), [arFields, values]);

  const tabs = [
    {id: 'en', label: 'English', complete: enComplete, mark: enComplete ? '✓' : '⚠'},
    {id: 'ar', label: 'العربية', complete: arComplete, mark: arComplete ? '✓' : '⚠'},
  ];
  if (showGeneral) {
    tabs.push({id: 'general', label: 'General', complete: true, mark: ''});
  }

  return (
    <div className="cms-i18n-tabs">
      <div className="cms-i18n-tablist" role="tablist" aria-label="Language">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`cms-i18n-tab${tab === item.id ? ' is-active' : ''}${
              item.id !== 'general' && !item.complete ? ' is-warn' : ''
            }`}
            onClick={() => setTab(item.id)}
          >
            <span>
              {item.id === 'en' ? `English ${item.mark}` : null}
              {item.id === 'ar' ? `Arabic ${item.mark}` : null}
              {item.id === 'general' ? item.label : null}
            </span>
          </button>
        ))}
      </div>

      <div className="cms-i18n-panel" role="tabpanel">
        {typeof children === 'function'
          ? children({tab, enComplete, arComplete})
          : null}

        {typeof children !== 'function' && renderField ? (
          <>
            {tab === 'en'
              ? enFields.map((field) => <div key={field.key}>{renderField(field)}</div>)
              : null}
            {tab === 'ar'
              ? arFields.map((field) => (
                  <div key={field.key}>{renderField({...field, dir: field.dir || 'rtl'})}</div>
                ))
              : null}
            {tab === 'general'
              ? generalFields.map((field) => <div key={field.key}>{renderField(field)}</div>)
              : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

export {fieldsComplete, isFilled};
