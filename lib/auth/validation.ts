// Form shapes and client-side validation for the auth pages.
// A future backend must validate again on the server; these rules only improve the UI.

import { emailPattern } from "@/lib/validation";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface SignupValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordValues {
  email: string;
}

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "letter", label: "One letter", test: (value: string) => /[a-z]/i.test(value) },
  { id: "number", label: "One number", test: (value: string) => /\d/.test(value) },
] as const;

function emailError(value: string): string | undefined {
  const email = value.trim();
  if (!email) return "Enter your email address.";
  if (!emailPattern.test(email)) return "Enter a valid email address, like name@example.com.";
}

export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  return {
    email: emailError(values.email),
    password: values.password ? undefined : "Enter your password.",
  };
}

export function validateSignup(values: SignupValues): FieldErrors<SignupValues> {
  const name = values.name.trim();
  let password: string | undefined;
  if (!values.password) password = "Create a password.";
  else if (!PASSWORD_RULES.every((rule) => rule.test(values.password))) password = "Use at least 8 characters, including a letter and a number.";

  let confirmPassword: string | undefined;
  if (!values.confirmPassword) confirmPassword = "Confirm your password.";
  else if (values.confirmPassword !== values.password) confirmPassword = "Passwords don't match.";

  return {
    name: !name ? "Enter your full name." : name.length < 2 ? "Name must be at least 2 characters." : undefined,
    email: emailError(values.email),
    password,
    confirmPassword,
    acceptTerms: values.acceptTerms ? undefined : "Accept the terms and conditions to continue.",
  };
}

export function validateForgotPassword(values: ForgotPasswordValues): FieldErrors<ForgotPasswordValues> {
  return { email: emailError(values.email) };
}
