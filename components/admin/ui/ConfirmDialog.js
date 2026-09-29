'use client';
import {adminText} from '@/lib/admin/translate';


import {useEffect} from 'react';
import AdminPortal from '@/components/admin/ui/AdminPortal';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === 'Escape') onCancel?.();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <AdminPortal>
    <div className="cms-overlay" role="presentation" onClick={onCancel}>
      <div
        className="cms-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cms-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="cms-confirm-title">{adminText(title)}</h2>
        {description ? <p>{adminText(description)}</p> : null}
        <div className="cms-dialog-actions">
          <button type="button" className="cms-btn-ghost" onClick={onCancel}>
            {adminText(cancelLabel)}
          </button>
          <button
            type="button"
            className={danger ? 'cms-btn-danger' : 'cms-btn'}
            onClick={onConfirm}
          >
            {adminText(confirmLabel)}
          </button>
        </div>
      </div>
    </div>
    </AdminPortal>
  );
}
