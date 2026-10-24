"use client";

import { Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { signIn } from "@/lib/auth";
import { type LoginValues, validateLogin } from "@/lib/auth/validation";
import styles from "./Auth.module.css";
import { CheckboxField, FormResult, PasswordField, SubmitButton, TextField } from "./fields";
import { useAuthForm } from "./useAuthForm";

const initial: LoginValues = { email: "", password: "", remember: false };

export default function LoginForm() {
  const { values, errors, submitting, result, setValue, blur, handleSubmit } = useAuthForm({
    initial,
    validate: validateLogin,
    onSubmit: async (v) => ({ result: await signIn(v), reset: { password: "" } }),
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
