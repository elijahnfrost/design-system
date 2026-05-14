import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Icon rendered to the left of the label. Pass any 16×16 SVG. */
  iconStart?: ReactNode;
  /** `center` (default) for hero CTAs, `start` for left-aligned form submits. */
  align?: "center" | "start";
  /** Stretch to container width on mobile; auto width from sm+. */
  block?: boolean;
};

const classes = {
  base: "ds-button",
  alignStart: "ds-button--align-start",
  block: "ds-button--block ds-button--block-sm-auto",
};

/**
 * Outline button — the canonical primary action on the source site.
 *
 * Renders a native <button>. Pass `iconStart` for a leading 16×16 SVG; the
 * stylesheet enforces the canonical stroke weight (1.5) so any compliant icon
 * looks consistent without prop juggling.
 */
export function Button({
  iconStart,
  align = "center",
  block = false,
  className,
  children,
  type,
  ...rest
}: ButtonProps) {
  const cls = [
    classes.base,
    align === "start" ? classes.alignStart : null,
    block ? classes.block : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...rest} type={type ?? "button"} className={cls}>
      {iconStart ? <span className="ds-button__icon">{iconStart}</span> : null}
      <span className="ds-button__label">{children}</span>
    </button>
  );
}
