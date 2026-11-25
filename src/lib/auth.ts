"use client";

import { useEffect, useState } from "react";

/**
 * Client-side auth store — mocked for the UI phase.
 * Persists a lightweight user record in localStorage so refreshes keep the
 * signed-in state. Backend wiring (C06: token-based auth with refresh, OTP
 * rate limits) slots in later by replacing requestOtp / verifyOtp / signInEmail.
 */

export type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  phone?: string; // E.164-ish, we store "+91XXXXXXXXXX"
  method: "mobile" | "email" | "google" | "apple";
  createdAt: number;
};

const STORAGE_KEY = "dbf.auth.user";

function readUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeUser(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  window.dispatchEvent(new CustomEvent("dbf-auth-changed"));
}

/** React hook — subscribes to auth changes across tabs and components. */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readUser());
    setReady(true);
    const refresh = () => setUser(readUser());
    window.addEventListener("storage", refresh);
    window.addEventListener("dbf-auth-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("dbf-auth-changed", refresh);
    };
  }, []);

  return { user, ready, signOut };
}

export function signOut() {
  writeUser(null);
}

/** Open the global auth modal from anywhere. */
export function openAuth() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("dbf-auth-open"));
}

/** Close the global auth modal from anywhere. */
export function closeAuth() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("dbf-auth-close"));
}

/** Mock OTP request — in production this hits the SMS gateway (C06 third-party). */
export async function requestOtp(phone: string): Promise<{ ok: true }> {
  await new Promise((r) => setTimeout(r, 600));
  // In mock mode, any 6-digit code is accepted by verifyOtp.
  console.info(`[mock] OTP sent to ${phone} — enter any 6-digit code to verify`);
  return { ok: true };
}

/** Mock OTP verify — accepts any 6-digit code and signs the user in. */
export async function verifyOtp(
  phone: string,
  code: string,
  opts?: { name?: string },
): Promise<AuthUser> {
  await new Promise((r) => setTimeout(r, 400));
  if (!/^\d{6}$/.test(code)) throw new Error("Enter the 6-digit code");
  const user: AuthUser = {
    id: `u_${Date.now()}`,
    name: opts?.name,
    phone,
    method: "mobile",
    createdAt: Date.now(),
  };
  writeUser(user);
  return user;
}

/**
 * Mock "accounts database" — just an email → password map in localStorage.
 * Lets the mock email flow distinguish not-found from wrong-password until
 * the real backend lands.
 */
const ACCOUNTS_KEY = "dbf.auth.accounts";

type AccountRecord = { password: string; name?: string };

function readAccounts(): Record<string, AccountRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AccountRecord>) : {};
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, AccountRecord>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export type AuthErrorCode =
  | "ACCOUNT_NOT_FOUND"
  | "ACCOUNT_EXISTS"
  | "BAD_PASSWORD"
  | "VALIDATION";

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "AuthError";
    // Restore prototype chain — without this, `instanceof AuthError` can be
    // false in some downlevel compilation targets, so the caller's typed
    // catch would silently miss the error.
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/** Duck-typed guard — reliable even if instanceof is unreliable. */
export function isAuthError(err: unknown): err is AuthError {
  return (
    !!err &&
    typeof err === "object" &&
    "code" in err &&
    "message" in err &&
    typeof (err as { code: unknown }).code === "string"
  );
}

/** Mock email sign-in. Throws AuthError("ACCOUNT_NOT_FOUND") when caller
 *  should be offered a "create account" option. */
export async function signInEmail(
  email: string,
  password: string,
): Promise<AuthUser> {
  await new Promise((r) => setTimeout(r, 400));
  const normalized = email.trim().toLowerCase();
  if (!normalized || !password)
    throw new AuthError("VALIDATION", "Email and password are required");
  const accounts = readAccounts();
  const record = accounts[normalized];
  if (!record) {
    throw new AuthError(
      "ACCOUNT_NOT_FOUND",
      "We couldn't find an account for this email.",
    );
  }
  if (record.password !== password) {
    throw new AuthError("BAD_PASSWORD", "Incorrect password. Try again.");
  }
  const user: AuthUser = {
    id: `u_${Date.now()}`,
    name: record.name,
    email: normalized,
    method: "email",
    createdAt: Date.now(),
  };
  writeUser(user);
  return user;
}

/** Mock email sign-up. Name is optional in the modal — we collect it on
 *  the profile screen later. */
export async function signUpEmail(
  email: string,
  password: string,
  name?: string,
): Promise<AuthUser> {
  await new Promise((r) => setTimeout(r, 400));
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new AuthError("VALIDATION", "Please enter your email");
  if (password.length < 6)
    throw new AuthError("VALIDATION", "Password must be at least 6 characters");
  const accounts = readAccounts();
  if (accounts[normalized]) {
    throw new AuthError(
      "ACCOUNT_EXISTS",
      "An account with this email already exists. Try signing in instead.",
    );
  }
  accounts[normalized] = { password, name: name?.trim() || undefined };
  writeAccounts(accounts);
  const user: AuthUser = {
    id: `u_${Date.now()}`,
    name: name?.trim() || undefined,
    email: normalized,
    method: "email",
    createdAt: Date.now(),
  };
  writeUser(user);
  return user;
}

/** Mock social sign-in. */
export async function signInSocial(
  provider: "google" | "apple",
): Promise<AuthUser> {
  await new Promise((r) => setTimeout(r, 500));
  const user: AuthUser = {
    id: `u_${Date.now()}`,
    name: provider === "google" ? "Google user" : "Apple user",
    method: provider,
    createdAt: Date.now(),
  };
  writeUser(user);
  return user;
}
