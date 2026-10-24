"use client";

import { type FormEvent, useState } from "react";
import type { AuthResult } from "@/lib/auth";
import type { FieldErrors } from "@/lib/auth/validation";

interface UseAuthFormOptions<T> {
  initial: T;
  validate: (values: T) => FieldErrors<T>;
  /** Returns the result to show and, optionally, fields to clear afterwards (e.g. passwords). */
  onSubmit: (values: T) => Promise<{ result: AuthResult; reset?: Partial<T> }>;
}

/**
 * Plain React state for the auth forms. Errors appear once a field is left or the form is submitted,
 * and a failed submit moves focus to the first invalid field.
 */
export function useAuthForm<T extends { [K in keyof T]: string | boolean }>({ initial, validate, onSubmit }: UseAuthFormOptions<T>) {
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AuthResult | null>(null);

  const allErrors = validate(values);
  const errors: FieldErrors<T> = {};
  for (const key of Object.keys(allErrors) as Array<keyof T>) {
    if (attempted || touched[key]) errors[key] = allErrors[key];
  }

  function setValue<K extends keyof T>(name: K, value: T[K]) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function blur(name: keyof T) {
    setTouched((current) => ({ ...current, [name]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const firstInvalid = (Object.keys(initial) as Array<keyof T & string>).find((key) => allErrors[key]);
    if (firstInvalid) {
      setAttempted(true);
      setResult(null);
      (event.currentTarget.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }
    setSubmitting(true);
    setResult(null);
    const outcome = await onSubmit(values);
    setValues((current) => ({ ...current, ...outcome.reset }));
    // Cleared fields shouldn't immediately flag themselves as missing.
    setAttempted(false);
    setTouched({});
    setResult(outcome.result);
    setSubmitting(false);
  }

  return { values, errors, submitting, result, setValue, blur, handleSubmit };
}
