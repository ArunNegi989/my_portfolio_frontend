// Auth calls used by the sign-in, sign-up and password screens and by the admin dashboard.
// Sessions live in HttpOnly cookies set by my-portfolio-backend; this module never sees a token.

import { api, ApiError, errorMessage, refreshSession, setSession, type SessionUser } from "@/lib/api/client";
import type { ForgotPasswordValues, LoginValues, ResetPasswordValues, SignupValues } from "./validation";

export interface AuthResult {
  status: "success" | "error" | "info";
  title: string;
  message: string;
}

interface SessionPayload {
  user: SessionUser;
  csrfToken: string;
}

export async function signIn({ email, password, remember }: LoginValues): Promise<{ result: AuthResult; user?: SessionUser }> {
  try {
    const session = await api.post<SessionPayload>("/auth/login", { email: email.trim(), password, remember }, { auth: false });
    setSession(session);
    if (session.user.role !== "admin") {
      return {
        user: session.user,
        result: { status: "info", title: "Signed in, but without dashboard access", message: "Your account exists, but an administrator hasn't granted it dashboard access yet." },
      };
    }
    return { user: session.user, result: { status: "success", title: "Signed in", message: "Opening the dashboard…" } };
  } catch (err) {
    const title = err instanceof ApiError && err.status === 429 ? "Too many attempts" : "Sign-in failed";
    return { result: { status: "error", title, message: errorMessage(err) } };
  }
}

export async function signUp({ name, email, password }: SignupValues): Promise<AuthResult> {
  try {
    const { message } = await api.post<{ message: string }>("/auth/signup", { name: name.trim(), email: email.trim(), password }, { auth: false });
    return { status: "info", title: "Request received", message };
  } catch (err) {
    return { status: "error", title: "Couldn't create the account", message: errorMessage(err) };
  }
}

export async function requestPasswordReset({ email }: ForgotPasswordValues): Promise<AuthResult> {
  try {
    const { message } = await api.post<{ message: string }>("/auth/forgot-password", { email: email.trim() }, { auth: false });
    return { status: "info", title: "Check your email", message };
  } catch (err) {
    return { status: "error", title: "Couldn't send the reset link", message: errorMessage(err) };
  }
}

export async function resetPassword(token: string, { password }: ResetPasswordValues): Promise<AuthResult> {
  try {
    const { message } = await api.post<{ message: string }>("/auth/reset-password", { token, password }, { auth: false });
    setSession(null);
    return { status: "success", title: "Password updated", message };
  } catch (err) {
    return { status: "error", title: "Couldn't reset the password", message: errorMessage(err) };
  }
}

/** Ends the session on the server (revokes it and clears the cookies), then forgets it locally. */
export async function signOut(): Promise<void> {
  try {
    await api.post("/auth/logout", undefined, { auth: false });
  } finally {
    setSession(null);
  }
}

/**
 * Returns the current session, refreshing it if the access token expired. Null when signed out.
 * Throws ApiError for other failures (e.g. the API is unreachable).
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const session = await api.get<SessionPayload>("/auth/me");
    setSession(session);
    return session;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      setSession(null);
      return null;
    }
    throw err;
  }
}

export { refreshSession };
export type { SessionUser };
