'use client';

export default function AIQuickActions({actions = [], onSelect, disabled, label}) {
  if (!actions?.length) return null;
  return (
    <div className="asas-ai-quick" aria-label={label}>
      {actions.map((item) => (
        <button key={item} type="button" disabled={disabled} onClick={() => onSelect?.(item)}>
          {item}
        </button>
      ))}
    </div>
  );
}
