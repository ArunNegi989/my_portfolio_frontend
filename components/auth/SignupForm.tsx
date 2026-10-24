"use client";

import { Check, Circle, Lock, Mail, ShieldCheck, User, UserPlus } from "lucide-react";
import { signUp } from "@/lib/auth";
import { PASSWORD_RULES, type SignupValues, validateSignup } from "@/lib/auth/validation";
import styles from "./Auth.module.css";
import { CheckboxField, FormResult, PasswordField, SubmitButton, TextField } from "./fields";
import { useAuthForm } from "./useAuthForm";

const initial: SignupValues = { name: "", email: "", password: "", confirmPassword: "", acceptTerms: false };

function PasswordChecklist({ value }: { value: string }) {
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

export default function SignupForm() {
  const { values, errors, submitting, result, setValue, blur, handleSubmit } = useAuthForm({
    initial,
    validate: validateSignup,
    onSubmit: async (v) => ({ result: await signUp(v), reset: { password: "", confirmPassword: "" } }),
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        name="name"
        label="Full name"
        icon={<User size={18} />}
        autoComplete="name"
        placeholder="Your full name"
        value={values.name}
        onChange={(e) => setValue("name", e.target.value)}
        onBlur={() => blur("name")}
        error={errors.name}
      />
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
        label="Confirm password"
        icon={<ShieldCheck size={18} />}
        autoComplete="new-password"
        placeholder="Repeat your password"
        value={values.confirmPassword}
        onChange={(e) => setValue("confirmPassword", e.target.value)}
        onBlur={() => blur("confirmPassword")}
        error={errors.confirmPassword}
      />
      <CheckboxField name="acceptTerms" checked={values.acceptTerms} onChange={(e) => setValue("acceptTerms", e.target.checked)} error={errors.acceptTerms}>
        I agree to the terms and conditions and privacy policy.
      </CheckboxField>
      <FormResult result={result} />
      <SubmitButton submitting={submitting} icon={<UserPlus size={18} />} busyLabel="Creating account…">
        Create account
      </SubmitButton>
    </form>
  );
}
