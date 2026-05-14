"use client";

import { useTheme } from "./ThemeProvider.js";

export type ThemeToggleProps = {
  className?: string;
  /** Override default ARIA labels. */
  labelLight?: string;
  labelDark?: string;
};

/** ~1px hairline at size-5 (20px) — same proportions as the source-site toggle. */
const ICON_STROKE = 1.2;

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      width={20}
      height={20}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      width={20}
      height={20}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * Reference theme toggle — uses the canonical focus ring + theme-toggle
 * marker (`data-theme-toggle`) so `tokens.css` can suppress the stroke tween
 * during the icon crossfade.
 */
export function ThemeToggle({
  className,
  labelLight = "Switch to light mode",
  labelDark = "Switch to dark mode",
}: ThemeToggleProps) {
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";

  const cls = [
    "ds-focus-ring",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      data-theme-toggle
      onClick={toggle}
      aria-label={isDark ? labelDark : labelLight}
      className={cls}
      style={{
        position: "relative",
        display: "inline-flex",
        height: "2.5rem",
        width: "2.5rem",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "var(--color-fg-muted)",
        transition: "color var(--duration-fast) var(--theme-transition-ease)",
      }}
    >
      <span style={{ position: "relative", display: "block", width: 20, height: 20 }}>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: isDark ? 1 : 0,
            transition: "opacity 75ms ease-out",
          }}
        >
          <SunIcon />
        </span>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: isDark ? 0 : 1,
            transition: "opacity 75ms ease-out",
          }}
        >
          <MoonIcon />
        </span>
      </span>
    </button>
  );
}
