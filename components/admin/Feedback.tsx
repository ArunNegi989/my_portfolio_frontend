"use client";

import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { cx } from "@/lib/utils";
import ui from "./admin.module.css";
import styles from "./Feedback.module.css";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface FeedbackContextValue {
  toast: (message: string, kind?: ToastKind) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error("useFeedback must be used inside <FeedbackProvider>");
  return ctx;
}

/** Toast notifications and a promise-based confirmation dialog for destructive actions. */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [pending, setPending] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const counter = useRef(0);

  const toast = useCallback((message: string, kind: ToastKind = "success") => {
    const id = ++counter.current;
    setToasts((list) => [...list, { id, kind, message }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4200);
  }, []);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setPending({ ...options, resolve });
      }),
    [],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (pending && !dialog.open) dialog.showModal();
  }, [pending]);

  const settle = (ok: boolean) => {
    pending?.resolve(ok);
    setPending(null);
    dialogRef.current?.close();
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onCancel={(e) => {
          e.preventDefault();
          settle(false);
        }}
      >
        {pending && (
          <div className={styles.dialogBody}>
            <div className={cx(styles.dialogIcon, pending.danger && styles.dialogIconDanger)}>
              <AlertTriangle size={20} aria-hidden="true" />
            </div>
            <h2 id="confirm-title" className={styles.dialogTitle}>
              {pending.title}
            </h2>
            <p id="confirm-message" className={styles.dialogMessage}>
              {pending.message}
            </p>
            <div className={styles.dialogActions}>
              <button type="button" className={ui.btn} onClick={() => settle(false)} autoFocus>
                Cancel
              </button>
              <button type="button" className={cx(ui.btn, pending.danger ? ui.btnDanger : ui.btnPrimary)} onClick={() => settle(true)}>
                {pending.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        )}
      </dialog>

      <div className={styles.toasts} role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={cx(styles.toast, styles[t.kind])} role={t.kind === "error" ? "alert" : "status"}>
            {t.kind === "success" ? (
              <CheckCircle2 size={18} aria-hidden="true" />
            ) : t.kind === "error" ? (
              <XCircle size={18} aria-hidden="true" />
            ) : (
              <Info size={18} aria-hidden="true" />
            )}
            <span>{t.message}</span>
            <button
              type="button"
              className={styles.toastClose}
              aria-label="Dismiss notification"
              onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}
