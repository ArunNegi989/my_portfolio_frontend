// Browser-side client for my-portfolio-backend.
// - Sends the HttpOnly auth cookies (credentials: "include"); tokens are never readable from JS.
// - Keeps the per-session CSRF token in memory and sends it on every write.
// - On a 401, refreshes the session once (shared by concurrent requests) and retries once.

import { API_URL } from "./config";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface FieldIssue {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: FieldIssue[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let csrfToken: string | null = null;
let refreshing: Promise<boolean> | null = null;
const expiredListeners = new Set<() => void>();

/**
 * Session state shared by every component (useSyncExternalStore). `checked` is false until the
 * server has been asked; sign-in, sign-out and expiry all update it, so every guard reacts at once.
 */
export interface SessionSnapshot {
  checked: boolean;
  user: SessionUser | null;
}
const UNCHECKED: SessionSnapshot = { checked: false, user: null };
let session: SessionSnapshot = UNCHECKED;
const sessionListeners = new Set<() => void>();

function emitSession(next: SessionSnapshot) {
  session = next;
  sessionListeners.forEach((listener) => listener());
}

export function setSession(next: { csrfToken: string; user: SessionUser } | null) {
  csrfToken = next?.csrfToken ?? null;
  emitSession({ checked: true, user: next?.user ?? null });
}

/** Forget what we know (e.g. page restored from the back/forward cache) so guards re-check. */
export function invalidateSession() {
  csrfToken = null;
  emitSession(UNCHECKED);
}

export const sessionStore = {
  subscribe(listener: () => void) {
    sessionListeners.add(listener);
    return () => sessionListeners.delete(listener);
  },
  getSnapshot: () => session,
  getServerSnapshot: () => UNCHECKED,
};

export const getCurrentUser = () => session.user;

/** Called when the session can no longer be refreshed (expired, revoked, logged out elsewhere). */
export function onSessionExpired(listener: () => void) {
  expiredListeners.add(listener);
  return () => expiredListeners.delete(listener);
}

function requireApiUrl() {
  if (!API_URL) throw new ApiError(0, "API_NOT_CONFIGURED", "The API URL is not configured. Set NEXT_PUBLIC_API_URL in .env.local.");
  return API_URL;
}

async function send(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${requireApiUrl()}${path}`, { credentials: "include", ...init });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, "NETWORK_ERROR", "Can't reach the server. Check your connection and try again.");
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  const body = await res.json().catch(() => null);
  const error = body?.error;
  return new ApiError(res.status, error?.code ?? "HTTP_ERROR", error?.message ?? `Request failed (${res.status}).`, error?.details ?? []);
}

/** Exchanges the refresh cookie for a new session. Concurrent callers share one request. */
export function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await send("/auth/refresh", { method: "POST" });
        if (!res.ok) {
          setSession(null);
          return false;
        }
        const body = await res.json();
        setSession(body.data);
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  form?: FormData;
  /** false for public auth endpoints that must not trigger a refresh-and-retry. */
  auth?: boolean;
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, number>;
}

async function request<T>(path: string, options: RequestOptions, retry: boolean): Promise<ApiEnvelope<T>> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET" && csrfToken) headers["X-CSRF-Token"] = csrfToken;

  const res = await send(path, {
    method,
    headers,
    body: options.form ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
  });

  if (options.auth !== false && retry) {
    const csrfRejected = res.status === 403 && (await res.clone().json().catch(() => null))?.error?.code === "CSRF_TOKEN_INVALID";
    if (res.status === 401 || csrfRejected) {
      if (await refreshSession()) return request<T>(path, options, false);
      expiredListeners.forEach((listener) => listener());
      throw await toApiError(res);
    }
  }

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return { data: undefined as T };
  return (await res.json()) as ApiEnvelope<T>;
}

export const api = {
  request: <T>(path: string, options: RequestOptions = {}) => request<T>(path, options, true),
  get: async <T>(path: string) => (await request<T>(path, {}, true)).data,
  post: async <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method" | "body"> = {}) => (await request<T>(path, { ...options, method: "POST", body }, true)).data,
  put: async <T>(path: string, body: unknown) => (await request<T>(path, { method: "PUT", body }, true)).data,
  patch: async <T>(path: string, body: unknown) => (await request<T>(path, { method: "PATCH", body }, true)).data,
  delete: async (path: string) => {
    await request<void>(path, { method: "DELETE" }, true);
  },
};

export interface UploadedMedia {
  id: string;
  url: string;
  kind: "image" | "document";
  originalName: string;
  mimeType: string;
  size: number;
}

/** Uploads one file to the admin media endpoint and returns its public URL. */
export async function uploadFile(file: File, purpose: "image" | "document"): Promise<UploadedMedia> {
  const form = new FormData();
  form.append("purpose", purpose);
  form.append("file", file);
  return (await request<UploadedMedia>("/admin/media", { method: "POST", form }, true)).data;
}

/** A readable message for any thrown value. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
