/**
 * Parallel TypeScript export of the design tokens.
 *
 * The CSS file (`tokens.css`) is the runtime source of truth — these constants
 * mirror it so non-CSS code (JS canvas, react-pdf, native modules) can read the
 * same values. If you update tokens.css, update this file the same way.
 *
 * Naming is semantic, never raw — consumers should reach for `tokens.color.fg`
 * rather than `#e4dfd8`.
 */

/** CSS custom-property name (with leading `--`) → semantic key. */
export const cssVar = {
  // type families
  fontSans: "--font-sans",
  fontSerif: "--font-serif",
  fontDisplay: "--font-display",

  // tracking
  trackingTight: "--tracking-tight",
  trackingLabelSm: "--tracking-label-sm",
  trackingLabel: "--tracking-label",
  trackingEyebrow: "--tracking-eyebrow",
  trackingDisplayEyebrow: "--tracking-display-eyebrow",

  // motion
  themeTransitionDuration: "--theme-transition-duration",
  themeTransitionEase: "--theme-transition-ease",
  easeOutQuint: "--ease-out-quint",
  easeOutQuart: "--ease-out-quart",
  durationFast: "--duration-fast",
  durationBase: "--duration-base",
  durationSlow: "--duration-slow",

  // color
  bgPage: "--color-bg-page",
  fg: "--color-fg",
  fgBright: "--color-fg-bright",
  fgMuted: "--color-fg-muted",
  fgDim: "--color-fg-dim",
  fgSoft: "--color-fg-soft",
  fgBody: "--color-fg-body",
  label: "--color-label",
  border: "--color-border",
  borderHover: "--color-border-hover",
  borderSection: "--color-border-section",
  borderDivider: "--color-border-divider",
  numeral: "--color-numeral",
  bullet: "--color-bullet",
  borderInputFocus: "--color-border-input-focus",
  borderInputError: "--color-border-input-error",
  borderInputErrorFocus: "--color-border-input-error-focus",
  chromeBorder: "--color-chrome-border",
  heroGrid: "--color-hero-grid",
  footerYear: "--color-footer-year",
  errorText: "--color-error-text",
  selectionBg: "--color-selection-bg",
  selectionFg: "--color-selection-fg",
  tapHighlight: "--color-tap-highlight",
  cursorFill: "--cursor-fill",
  cursorStroke: "--cursor-stroke",
  cursorArrowFill: "--cursor-arrow-fill",
} as const;

/** `var(--name)` wrappers — use these in inline styles. */
export const ref = Object.fromEntries(
  Object.entries(cssVar).map(([key, name]) => [key, `var(${name})`])
) as Readonly<Record<keyof typeof cssVar, string>>;

/** Literal palette values — for environments that cannot read CSS variables (PDF, canvas, native). */
export const palette = {
  dark: {
    bgPage: "#0d0d0d",
    fg: "#e4dfd8",
    fgBright: "#ffffff",
    fgMuted: "#6b6660",
    fgDim: "#4a4643",
    fgSoft: "#8a8580",
    fgBody: "#7a7670",
    label: "#3a3733",
    border: "#2a2a2a",
    borderHover: "#444444",
    borderSection: "#1e1e1e",
    borderDivider: "#1a1a1a",
    numeral: "#2e2c2a",
    bullet: "#3a3733",
    borderInputFocus: "#2e2e2e",
    borderInputError: "#3a322f",
    borderInputErrorFocus: "#4a3f3a",
    chromeBorder: "rgba(34, 34, 34, 0.42)",
    heroGrid: "#e4dfd8",
    footerYear: "#2a2a2a",
    errorText: "#5a4a4a",
    tapHighlight: "rgba(228, 223, 216, 0.12)",
  },
  light: {
    bgPage: "#faf8f5",
    fg: "#1c1917",
    fgBright: "#0c0a09",
    fgMuted: "#5c5750",
    fgDim: "#6b6560",
    fgSoft: "#7a7570",
    fgBody: "#5e5950",
    label: "#8a8580",
    border: "#d4cfc5",
    borderHover: "#a8a29a",
    borderSection: "#e0dcd5",
    borderDivider: "#d9d4cc",
    numeral: "#c4bfb6",
    bullet: "#c4bfb6",
    borderInputFocus: "#a8a29a",
    borderInputError: "#c4a89a",
    borderInputErrorFocus: "#b89888",
    chromeBorder: "rgba(120, 113, 103, 0.35)",
    heroGrid: "#1c1917",
    footerYear: "#c4bfb6",
    errorText: "#8a6a6a",
    tapHighlight: "rgba(28, 25, 23, 0.08)",
  },
} as const;

export const tracking = {
  tight: "-0.01em",
  labelSm: "0.18em",
  label: "0.2em",
  eyebrow: "0.25em",
  displayEyebrow: "0.28em",
} as const;

export const motion = {
  themeTransitionDuration: "120ms",
  themeTransitionEase: "linear",
  easeOutQuint: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeOutQuart: "cubic-bezier(0.22, 1, 0.36, 1)",
  durationFast: "100ms",
  durationBase: "120ms",
  durationSlow: "220ms",
  fadeUpDelays: ["0ms", "40ms", "80ms", "120ms"] as const,
  fadeUpDuration: "320ms",
} as const;

/** Meta theme-color values that match `--color-bg-page` for the address bar. */
export const themeColor = {
  dark: palette.dark.bgPage,
  light: palette.light.bgPage,
} as const;

export type Theme = "dark" | "light";
