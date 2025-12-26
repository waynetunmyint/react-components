import React, { createContext, useContext, useState, useCallback } from 'react';

type Toast = { id: number; message: string; timeout?: number };

type ToastContextValue = {
  toasts: Toast[];
  show: (message: string, timeout?: number) => void;
  remove: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, timeout = 3000) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const t: Toast = { id, message, timeout };
    setToasts((s) => [...s, t]);
    if (timeout > 0) {
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), timeout);
    }
  }, []);
  const remove = useCallback((id: number) => setToasts((s) => s.filter((t) => t.id !== id)), []);

  return (
    <ToastContext.Provider value={{ toasts, show, remove }}>
      {children}
      <div className="fixed left-4 bottom-6 z-50 flex flex-col gap-2 items-start">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="max-w-xs w-80 rounded shadow-lg text-sm"
            style={{
              background: 'var(--page-background-color)',
              color: 'var(--page-text-color)',
              border: '1px solid var(--page-button-color)',
            }}
          >
            <div className="px-3 py-2">
              <div className="font-semibold pb-1 border-b" style={{ borderColor: 'var(--page-button-color)' }}>
                Notification
              </div>
              <div className="pt-2 text-left whitespace-pre-wrap">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastContext;
