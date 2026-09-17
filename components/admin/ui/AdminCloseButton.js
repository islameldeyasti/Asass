'use client';

import {X} from 'lucide-react';

export default function AdminCloseButton({onClick, disabled = false, label = 'Close', className = ''}) {
  return (
    <button
      type="button"
      className={`adm-close-btn${className ? ` ${className}` : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <X size={16} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}
