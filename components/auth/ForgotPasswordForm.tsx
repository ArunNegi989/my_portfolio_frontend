"use client";

import { Mail, Send } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth";
import { type ForgotPasswordValues, validateForgotPassword } from "@/lib/auth/validation";
import styles from "./Auth.module.css";
import { FormResult, SubmitButton, TextField } from "./fields";
import { useAuthForm } from "./useAuthForm";

const initial: ForgotPasswordValues = { email: "" };

export default function ForgotPasswordForm() {
  const { values, errors, submitting, result, setValue, blur, handleSubmit } = useAuthForm({
    initial,
    validate: validateForgotPassword,
    onSubmit: async (v) => ({ result: await requestPasswordReset(v) }),
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
      <FormResult result={result} />
      <SubmitButton submitting={submitting} icon={<Send size={18} />} busyLabel="Checking…">
        Request reset link
      </SubmitButton>
    </form>
  );
}
