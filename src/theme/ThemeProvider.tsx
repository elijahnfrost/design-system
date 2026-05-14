"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { themeColor } from "../tokens/tokens.js";
import type { Theme } from "../tokens/tokens.js";

/** User preference — `system` defers to OS via prefers-color-scheme. */
export type ThemePreference = Theme | "system";

type ThemeContextValue = {
  /** What the user picked (may be `system`). */
  theme: ThemePreference;
  /** What's actually applied right now — never `system`. */
  resolvedTheme: Theme;
  setTheme: (next: ThemePreference) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export type ThemeProviderProps = {
  children: ReactNode;
  /** localStorage key for persistence. Pick something project-scoped to avoid collisions. */
  storageKey?: string;
  /** Default if nothing stored yet. */
  defaultTheme?: ThemePreference;
  /** Class added to <html> when light is active. Dark is implicit via `:root`. */
  lightClass?: string;
  /**
   * Keep `<meta name="theme-color">` synced to the resolved palette. Default `true`.
   * Pass `false` if you manage the meta tag yourself.
   */
  syncMetaThemeColor?: boolean;
};

function readSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function readStoredTheme(storageKey: string): ThemePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    return null;
  } catch {
    return null;
  }
}

function writeStoredTheme(storageKey: string, value: ThemePreference) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, value);
  } catch {
    /* localStorage unavailable (private mode etc.) — best-effort only */
  }
}

function applyResolved(theme: Theme, lightClass: string, syncMeta: boolean) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "light") root.classList.add(lightClass);
  else root.classList.remove(lightClass);

  if (syncMeta) {
    const content = theme === "light" ? themeColor.light : themeColor.dark;
    document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
      el.setAttribute("content", content);
    });
  }
}

/**
 * Vanilla theme provider — no external dependency.
 *
 * Toggles `html.light` for the light palette (dark is `:root` default). Reads
 * and writes `localStorage[storageKey]`. Tracks system preference when
 * `theme === "system"` so OS changes propagate live.
 *
 * SSR-safe: the provider mounts before any class is applied. To prevent a
 * dark-flash on first paint in light, inject the small bootstrap script
 * exported as `themeBootstrap()` into <head> ahead of the React tree.
 */
export function ThemeProvider({
  children,
  storageKey = "ds-theme",
  defaultTheme = "system",
  lightClass = "light",
  syncMetaThemeColor = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Hydrate from storage + system on mount.
  useEffect(() => {
    setMounted(true);
    const stored = readStoredTheme(storageKey);
    if (stored) setThemeState(stored);
    setSystemTheme(readSystemTheme());
  }, [storageKey]);

  // Watch system preference for live changes (only matters when theme === "system").
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const sync = () => setSystemTheme(mq.matches ? "light" : "dark");
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const resolvedTheme: Theme = theme === "system" ? systemTheme : theme;

  // Apply class + meta whenever the resolved palette changes.
  useEffect(() => {
    if (!mounted) return;
    applyResolved(resolvedTheme, lightClass, syncMetaThemeColor);
  }, [mounted, resolvedTheme, lightClass, syncMetaThemeColor]);

  const setTheme = useCallback(
    (next: ThemePreference) => {
      setThemeState(next);
      writeStoredTheme(storageKey, next);
    },
    [storageKey]
  );

  const toggle = useCallback(() => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  }, [resolvedTheme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggle }),
    [theme, resolvedTheme, setTheme, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return ctx;
}

/**
 * Returns a short blocking script that applies the stored theme before paint,
 * to avoid a dark-flash when light is the persisted choice.
 *
 * Inject into <head> ahead of the React tree:
 *   <script dangerouslySetInnerHTML={{ __html: themeBootstrap() }} />
 */
export function themeBootstrap(
  storageKey = "ds-theme",
  lightClass = "light"
): string {
  return `(()=>{try{var k=${JSON.stringify(storageKey)};var c=${JSON.stringify(lightClass)};var s=localStorage.getItem(k);var l=(s==="light")||((s==null||s==="system")&&window.matchMedia("(prefers-color-scheme: light)").matches);if(l)document.documentElement.classList.add(c);}catch(e){}})();`;
}
