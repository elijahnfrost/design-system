"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

export type BackgroundGridProps = {
  /** Grid cell size in pixels. Default: 60. */
  cellSize?: number;
  /** Hairline weight in pixels. Default: 1. */
  lineWidth?: number;
  /** Overall opacity 0–1. Default: 0.04 — barely-there texture. */
  opacity?: number;
  /**
   * Stroke color for the grid lines. Defaults to `var(--color-hero-grid)` so
   * the grid tweens through the same color transition as text. Pass any CSS
   * color (including another `var()`) to override.
   */
  color?: string;
  /**
   * Radial mask string applied to both `mask-image` and `-webkit-mask-image`.
   * Default reproduces the source-site soft vignette.
   */
  mask?: string;
  /**
   * Disable the grid below this CSS pixel width. Default: undefined (render at
   * all viewports). Set to `640` to gate on the `sm` breakpoint.
   */
  disableBelow?: number;
  /** Optional className appended to the wrapper div. */
  className?: string;
  /** Optional inline style merged onto the wrapper div (won't override grid styles). */
  style?: CSSProperties;
};

const DEFAULT_MASK =
  "radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 75%)";

function useViewportGate(disableBelow: number | undefined) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (disableBelow === undefined) {
      setEnabled(true);
      return;
    }
    const mq = window.matchMedia(`(min-width: ${disableBelow}px)`);
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [disableBelow]);

  return enabled;
}

/**
 * Decorative crosshatch background — the hero treatment from the source site,
 * exposed with configurable spacing/weight/opacity.
 *
 * Drop inside any `position: relative` container; renders absolute-positioned,
 * `pointer-events: none`. The grid color defaults to `var(--color-hero-grid)`
 * so it follows the same theme crossfade as text.
 */
export function BackgroundGrid({
  cellSize = 60,
  lineWidth = 1,
  opacity = 0.04,
  color,
  mask = DEFAULT_MASK,
  disableBelow,
  className,
  style,
}: BackgroundGridProps) {
  const enabled = useViewportGate(disableBelow);
  if (!enabled) return null;

  const stroke = color ?? "var(--color-hero-grid)";
  const computedStyle: CSSProperties = {
    color: stroke,
    backgroundImage: `linear-gradient(currentColor ${lineWidth}px, transparent ${lineWidth}px), linear-gradient(90deg, currentColor ${lineWidth}px, transparent ${lineWidth}px)`,
    backgroundSize: `${cellSize}px ${cellSize}px`,
    opacity,
    maskImage: mask,
    WebkitMaskImage: mask,
    ...style,
  };

  const cls = ["ds-bg-grid", className].filter(Boolean).join(" ");

  return (
    <div
      aria-hidden="true"
      className={cls}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        ...computedStyle,
      }}
    />
  );
}
