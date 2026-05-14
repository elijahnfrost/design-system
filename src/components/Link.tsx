import type { AnchorHTMLAttributes } from "react";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** `default` (underlined, primary fg) or `quiet` (no underline, soft fg). */
  variant?: "default" | "quiet";
};

/**
 * Plain inline link. Mirrors the underline + offset used in the cursor-doc page
 * and the bright-on-hover treatment used by entry-title links throughout the
 * source site.
 */
export function Link({ variant = "default", className, ...rest }: LinkProps) {
  const cls = [
    "ds-link",
    variant === "quiet" ? "ds-link--quiet" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <a {...rest} className={cls} />;
}
