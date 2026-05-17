/*
 * Scope module — read the visitor's effective auth scope and react to changes.
 *
 * The auth gate (auth.elijahfrost.com) writes an advisory `ef_scope` cookie
 * alongside the HttpOnly enforcement cookie. This module reads that cookie
 * so apps can flip UI affordances locally without a server round-trip. All
 * real enforcement still happens at the edge.
 *
 * SSR-safe: getScope returns "none" when document is unavailable.
 */

export type Scope = "none" | "read" | "write" | "admin";
export type MinScope = Exclude<Scope, "none">;

export const SCOPE_RANK: Record<Scope, number> = {
  none: 0,
  read: 1,
  write: 2,
  admin: 3,
};

const SCOPE_COOKIE_NAME = "ef_scope";
const POLL_INTERVAL_MS = 5_000;

function scopeFromString(s: string | null | undefined): Scope {
  if (s === "read" || s === "write" || s === "admin") return s;
  return "none";
}

/**
 * Read the current scope from the ef_scope cookie. Returns "none" in SSR
 * contexts or when the cookie is missing/invalid.
 */
export function getScope(): Scope {
  if (typeof document === "undefined") return "none";
  const parts = document.cookie ? document.cookie.split(";") : [];
  for (const raw of parts) {
    const trimmed = raw.trim();
    if (trimmed.startsWith(SCOPE_COOKIE_NAME + "=")) {
      const v = decodeURIComponent(trimmed.slice(SCOPE_COOKIE_NAME.length + 1));
      return scopeFromString(v);
    }
  }
  return "none";
}

/**
 * Returns true if the current scope meets or exceeds `min`.
 */
export function isAtLeast(min: MinScope): boolean {
  return SCOPE_RANK[getScope()] >= SCOPE_RANK[min];
}

type Handler = (scope: Scope) => void;
const subscribers = new Set<Handler>();
let pollTimer: ReturnType<typeof setInterval> | null = null;
let lastScope: Scope = "none";

function startPolling(): void {
  if (typeof window === "undefined") return;
  if (pollTimer !== null) return;
  lastScope = getScope();
  pollTimer = setInterval(checkAndBroadcast, POLL_INTERVAL_MS);
}

function stopPollingIfIdle(): void {
  if (subscribers.size > 0) return;
  if (pollTimer === null) return;
  clearInterval(pollTimer);
  pollTimer = null;
}

function checkAndBroadcast(): void {
  const next = getScope();
  if (next === lastScope) return;
  lastScope = next;
  for (const h of subscribers) {
    try {
      h(next);
    } catch {
      // subscribers must not break the polling loop
    }
  }
}

/**
 * Subscribe to scope changes. The handler is called on every transition
 * (not on subscribe). Returns an unsubscribe function.
 */
export function onScopeChange(handler: Handler): () => void {
  subscribers.add(handler);
  startPolling();
  return () => {
    subscribers.delete(handler);
    stopPollingIfIdle();
  };
}

/**
 * Internal: force an immediate scope check and broadcast. Used by the
 * vanilla auto-script after re-walking the DOM so the React tree and the
 * vanilla guards stay coherent.
 */
export function _checkScopeNow(): void {
  checkAndBroadcast();
}
