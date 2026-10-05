import React from 'react';
import { useUIStore } from '../../store/uiStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-16 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let borderClass = 'border-l-4 border-l-tertiary';
        let icon = 'check_circle';
        let iconColor = 'text-tertiary';

        if (toast.type === 'ERROR') {
          borderClass = 'border-l-4 border-l-error';
          icon = 'error';
          iconColor = 'text-error';
        } else if (toast.type === 'WARNING') {
          borderClass = 'border-l-4 border-l-amber-500';
          icon = 'warning';
          iconColor = 'text-amber-500';
        } else if (toast.type === 'INFO') {
          borderClass = 'border-l-4 border-l-secondary';
          icon = 'info';
          iconColor = 'text-secondary';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-lowest shadow-xl border border-surface-container-high ${borderClass} animate-in fade-in slide-in-from-right-4 duration-200`}
          >
            <span className={`material-symbols-outlined text-[20px] ${iconColor} mt-0.5`}>
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="font-headline-sm text-label-md font-bold text-on-surface">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
