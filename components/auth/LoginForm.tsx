"use client";

import { Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { type LoginValues, validateLogin } from "@/lib/auth/validation";
import styles from "./Auth.module.css";
import { CheckboxField, FormResult, PasswordField, SubmitButton, TextField } from "./fields";
import { useAuthForm } from "./useAuthForm";

const initial: LoginValues = { email: "", password: "", remember: true };

/** Only same-site dashboard paths are accepted as a post-login destination (no open redirects). */
function safeNext(): string {
  if (typeof window === "undefined") return "/admin";
  const next = new URLSearchParams(window.location.search).get("next");
  return next && /^\/admin(\/[\w\-/]*)?$/.test(next) ? next : "/admin";
}

export default function LoginForm() {
  const router = useRouter();
  const { values, errors, submitting, result, setValue, blur, handleSubmit } = useAuthForm({
    initial,
    validate: validateLogin,
    onSubmit: async (v) => {
      const { result: outcome, user } = await signIn(v);
      if (outcome.status === "success") router.replace(safeNext());
      // A valid account without the admin role gets no dashboard session.
      else if (user) await signOut().catch(() => {});
      return { result: outcome, reset: { password: "" } };
    },
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        name="email"
        type="email"
        label="Email address"
        icon={<Mail size={18} />}
        autoComplete="email"
        inputMode="email"
        placeholder="you@example.com"
        value={values.email}
        onChange={(e) => setValue("email", e.target.value)}
        onBlur={() => blur("email")}
        error={errors.email}
      />
      <PasswordField
        name="password"
        label="Password"
        icon={<Lock size={18} />}
        autoComplete="current-password"
        placeholder="Enter your password"
        value={values.password}
        onChange={(e) => setValue("password", e.target.value)}
        onBlur={() => blur("password")}
        error={errors.password}
      />
      <div className={styles.row}>
        <CheckboxField name="remember" checked={values.remember} onChange={(e) => setValue("remember", e.target.checked)}>
          Remember me
        </CheckboxField>
        <Link href="/forgot-password" className={styles.link}>
          Forgot password?
        </Link>
      </div>
      <FormResult result={result} />
      <SubmitButton submitting={submitting} icon={<LogIn size={18} />} busyLabel="Signing in…">
        Sign in
      </SubmitButton>
    </form>
  );
}
