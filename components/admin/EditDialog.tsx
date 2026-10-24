"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import ui from "./admin.module.css";
import styles from "./EditDialog.module.css";

interface EditDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  onSubmit: () => void;
}

/** Modal form container built on the native <dialog> element (focus trap + Esc for free). */
export default function EditDialog({ open, title, onClose, children, footer, onSubmit }: EditDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Never leave a modal open behind a hidden (Activity) route.
  useEffect(() => {
    const dialog = ref.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="edit-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {open && (
        <form
          className={styles.form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <header className={styles.header}>
            <h2 id="edit-dialog-title">{title}</h2>
            <button type="button" className={ui.iconBtn} onClick={onClose} aria-label="Close dialog">
              <X size={18} aria-hidden="true" />
            </button>
          </header>
          <div className={styles.body} data-lenis-prevent>
            {children}
          </div>
          <footer className={styles.footer}>{footer}</footer>
        </form>
      )}
    </dialog>
  );
}
