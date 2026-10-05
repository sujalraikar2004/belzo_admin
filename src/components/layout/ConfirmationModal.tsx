import React from 'react';
import { useUIStore } from '../../store/uiStore';

export const ConfirmationModal: React.FC = () => {
  const { confirmDialog, closeConfirm } = useUIStore();

  if (!confirmDialog.isOpen) return null;

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    closeConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high p-space-lg flex flex-col gap-space-sm">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              confirmDialog.isDestructive ? 'bg-error-container text-error' : 'bg-primary-fixed text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {confirmDialog.isDestructive ? 'warning' : 'help'}
            </span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              {confirmDialog.title}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {confirmDialog.message}
            </p>
          </div>
        </div>

        {confirmDialog.impact && (
          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high text-body-sm text-on-surface font-medium flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px] text-amber-600 mt-0.5">info</span>
            <div>
              <span className="font-bold text-on-surface">System Impact: </span>
              <span>{confirmDialog.impact}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={closeConfirm}
            type="button"
            className="h-9 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors"
          >
            {confirmDialog.cancelText || 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            type="button"
            className={`h-9 px-4 rounded-lg font-label-md text-label-md font-bold transition-all shadow-sm active:scale-95 ${
              confirmDialog.isDestructive
                ? 'bg-error text-on-error hover:bg-error/90'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            }`}
          >
            {confirmDialog.confirmText || 'Confirm Action'}
          </button>
        </div>
      </div>
    </div>
  );
};
