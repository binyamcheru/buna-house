"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirmDialog = useCallback<ConfirmFn>((opts) => {
    setOptions(typeof opts === "string" ? { message: opts } : opts);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = (result: boolean) => {
    resolveRef.current?.(result);
    resolveRef.current = null;
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirmDialog}>
      {children}
      {options && (
        <div className="modal-overlay" onClick={() => handleClose(false)}>
          <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{options.title || (options.danger ? "Confirm Deletion" : "Please Confirm")}</h2>
            </div>
            <div className="modal-form">
              <p className="confirm-message">{options.message}</p>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => handleClose(false)}>
                  {options.cancelText || "Cancel"}
                </button>
                <button
                  type="button"
                  className={options.danger ? "btn btn-delete" : "btn btn-primary"}
                  onClick={() => handleClose(true)}
                >
                  {options.confirmText || "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}
