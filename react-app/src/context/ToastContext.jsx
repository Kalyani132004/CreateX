import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastCtx = createContext(null);

const ICONS = { success: 'bi-check-circle-fill', error: 'bi-exclamation-circle-fill', warn: 'bi-exclamation-triangle-fill' };
const COLORS = { success: 'var(--c-success)', error: 'var(--c-danger)', warn: 'var(--c-warning)' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast: push }}>
      {children}
      <div className="cx-toast-wrap" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`cx-toast ${t.type === 'success' ? '' : t.type}`}>
            <i className={`bi ${ICONS[t.type]}`} style={{ color: COLORS[t.type], fontSize: '1.05rem', marginTop: 1 }} />
            <div>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/** const { toast } = useToast(); toast('Project submitted successfully.'); */
export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}
