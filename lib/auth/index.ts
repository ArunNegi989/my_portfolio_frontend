// DEMO AUTH SEAM — nothing here authenticates anyone, stores credentials, creates sessions or sends email.
// The auth forms only call these functions. Phase 2 replaces their bodies with real API calls
// (plus server-side sessions and a proxy.ts check for /admin) without changing the form components.

import type { ForgotPasswordValues, LoginValues, SignupValues } from "./validation";

export interface AuthResult {
  /** Phase 2 adds "success" and "error". */
  status: "demo";
  title: string;
  message: string;
}

const simulateLatency = () => new Promise((resolve) => setTimeout(resolve, 900));

export async function signIn({ email }: LoginValues): Promise<AuthResult> {
  await simulateLatency();
  return {
    status: "demo",
    title: "Demo mode: you are not signed in",
    message: `Sign-in isn't connected to a backend yet, so no account was checked for ${email.trim()} and no session was created.`,
  };
}

export async function signUp({ email }: SignupValues): Promise<AuthResult> {
  await simulateLatency();
  return {
    status: "demo",
    title: "Demo mode: no account was created",
    message: `Account creation isn't connected to a backend yet, so nothing was saved for ${email.trim()}. You'll be able to register once the backend is live.`,
  };
}

export async function requestPasswordReset({ email }: ForgotPasswordValues): Promise<AuthResult> {
  await simulateLatency();
  return {
    status: "demo",
    title: "Password recovery isn't available yet",
    message: `Password recovery will be available after backend integration. No email was sent to ${email.trim()}.`,
  };
}
