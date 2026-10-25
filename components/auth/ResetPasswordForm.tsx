"use client";

import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { resetPassword } from "@/lib/auth";
import { type ResetPasswordValues, validateResetPassword } from "@/lib/auth/validation";
import styles from "./Auth.module.css";
import { FormResult, PasswordChecklist, PasswordField, SubmitButton } from "./fields";
import { useAuthForm } from "./useAuthForm";

const initial: ResetPasswordValues = { password: "", confirmPassword: "" };

/**
 * Reads the single-use token from the emailed link, then removes it from the address bar and
 * history so it isn't left behind in the browser.
 */
function useResetToken() {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    const url = new URL(window.location.href);
    const value = url.searchParams.get("token");
    if (value) {
      url.searchParams.delete("token");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
    // Reading the URL is only possible after mount (the page is prerendered without it).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(value);
  }, []);
  return token;
}

export default function ResetPasswordForm() {
  const token = useResetToken();
  const [done, setDone] = useState(false);
  const { values, errors, submitting, result, setValue, blur, handleSubmit } = useAuthForm({
    initial,
    validate: validateResetPassword,
    onSubmit: async (v) => {
      const outcome = await resetPassword(token ?? "", v);
      if (outcome.status === "success") setDone(true);
      return { result: outcome, reset: { password: "", confirmPassword: "" } };
    },
  });

  if (token === undefined) return null;
  if (!token) {
    return (
      <div className={styles.form}>
        <FormResult result={{ status: "error", title: "This link is incomplete", message: "Open the link from your reset email again, or request a new one." }} />
        <Link href="/forgot-password" className={styles.link}>
          <KeyRound size={16} aria-hidden="true" /> Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className={styles.form}>
        <FormResult result={result} />
        <Link href="/login" className={styles.link}>
          Sign in with your new password
        </Link>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <PasswordField
        name="password"
        label="New password"
        icon={<Lock size={18} />}
        autoComplete="new-password"
        placeholder="Create a password"
        value={values.password}
        onChange={(e) => setValue("password", e.target.value)}
        onBlur={() => blur("password")}
        error={errors.password}
        hint={<PasswordChecklist value={values.password} />}
      />
      <PasswordField
        name="confirmPassword"
        label="Confirm new password"
        icon={<ShieldCheck size={18} />}
        autoComplete="new-password"
        placeholder="Repeat your password"
        value={values.confirmPassword}
        onChange={(e) => setValue("confirmPassword", e.target.value)}
        onBlur={() => blur("confirmPassword")}
        error={errors.confirmPassword}
      />
      <FormResult result={result} />
      <SubmitButton submitting={submitting} icon={<KeyRound size={18} />} busyLabel="Saving…">
        Set new password
      </SubmitButton>
    </form>
  );
}
