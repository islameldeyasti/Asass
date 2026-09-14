'use client';

import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {X} from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({children}) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({title, description, variant = 'info', duration = 4000} = {}) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, {id, title, description, variant}]);
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({toast, dismiss}), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="cms-toast-stack no-print" aria-live="polite" aria-relevant="additions">
        {toasts.map((item) => (
          <div key={item.id} className={`cms-toast is-${item.variant}`} role="status">
            <div className="cms-toast-body">
              {item.title ? <strong>{item.title}</strong> : null}
              {item.description ? <p>{item.description}</p> : null}
            </div>
            <button
              type="button"
              className="cms-toast-close"
              aria-label="Dismiss"
              onClick={() => dismiss(item.id)}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
