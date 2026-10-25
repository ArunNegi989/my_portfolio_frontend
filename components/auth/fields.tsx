"use client";

import { AlertCircle, Check, CheckCircle2, Circle, Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { type InputHTMLAttributes, type ReactNode, useId, useState } from "react";
import buttonStyles from "@/components/shared/Button.module.css";
import type { AuthResult } from "@/lib/auth";
import { PASSWORD_RULES } from "@/lib/auth/validation";
import { cx } from "@/lib/utils";
import styles from "./Auth.module.css";

/** Live checklist of the password rules, shown under new-password fields. */
export function PasswordChecklist({ value }: { value: string }) {
  return (
    <ul role="list" className={styles.rules}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(value);
        return (
          <li key={rule.id} className={met ? styles.ruleMet : undefined}>
            {met ? <Check size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
            {rule.label}
            <span className="sr-only">{met ? " (met)" : " (not met yet)"}</span>
          </li>
        );
      })}
    </ul>
  );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "name"> & {
  name: string;
  label: string;
  icon: ReactNode;
  error?: string;
  hint?: ReactNode;
};

function describedBy(id: string, error?: string, hint?: ReactNode) {
  return cx(hint ? `${id}-hint` : undefined, error ? `${id}-error` : undefined) || undefined;
}

function FieldMessages({ id, error, hint }: { id: string; error?: string; hint?: ReactNode }) {
  return (
    <>
      {hint && (
        <div id={`${id}-hint`} className={styles.hint}>
          {hint}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.error}>
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </p>
      )}
    </>
  );
}

export function TextField({ label, icon, error, hint, className, ...rest }: InputProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.control}>
        <span className={styles.leadIcon} aria-hidden="true">
          {icon}
        </span>
        <input id={id} className={cx(styles.input, className)} aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error, hint)} {...rest} />
      </div>
      <FieldMessages id={id} error={error} hint={hint} />
    </div>
  );
}

export function PasswordField({ label, icon, error, hint, className, ...rest }: Omit<InputProps, "type">) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={cx(styles.control, styles.hasToggle)}>
        <span className={styles.leadIcon} aria-hidden="true">
          {icon}
        </span>
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={cx(styles.input, className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          autoCapitalize="off"
          spellCheck={false}
          {...rest}
        />
        <button type="button" className={styles.toggle} onClick={() => setVisible((v) => !v)} aria-controls={id} aria-pressed={visible} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
      <FieldMessages id={id} error={error} hint={hint} />
    </div>
  );
}

export function CheckboxField({ children, error, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children"> & { name: string; children: ReactNode; error?: string }) {
  const id = useId();
  return (
    <div className={styles.checkField}>
      <label htmlFor={id} className={styles.check}>
        <input id={id} type="checkbox" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
        <span>{children}</span>
      </label>
      <FieldMessages id={id} error={error} />
    </div>
  );
}

export function SubmitButton({ submitting, icon, busyLabel, children }: { submitting: boolean; icon: ReactNode; busyLabel: string; children: ReactNode }) {
  // aria-disabled instead of disabled keeps keyboard focus on the button while the request runs.
  return (
    <button type="submit" className={cx(buttonStyles.button, buttonStyles.primary, styles.submit)} aria-disabled={submitting || undefined} aria-busy={submitting || undefined}>
      {submitting ? (
        <>
          <Loader2 size={18} className={styles.spin} aria-hidden="true" /> {busyLabel}
        </>
      ) : (
        <>
          {children}
          <span className={buttonStyles.icon} aria-hidden="true">
            {icon}
          </span>
        </>
      )}
    </button>
  );
}

/** Live region that announces the outcome of a submission (errors, confirmations, next steps). */
export function FormResult({ result }: { result: AuthResult | null }) {
  const Icon = result?.status === "error" ? AlertCircle : result?.status === "success" ? CheckCircle2 : Info;
  return (
    <div role="status" aria-live="polite" className={styles.resultSlot}>
      {result && (
        <div className={cx(styles.result, result.status === "error" && styles.resultError, result.status === "success" && styles.resultSuccess)}>
          <Icon size={18} aria-hidden="true" />
          <div>
            <p className={styles.resultTitle}>{result.title}</p>
            <p>{result.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
