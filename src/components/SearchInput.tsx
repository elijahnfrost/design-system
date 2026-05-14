import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Leading icon (16×16). Defaults to a magnifier glyph. */
  icon?: ReactNode;
  invalid?: boolean;
};

function DefaultSearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="ds-search__icon"
    >
      <circle cx="9" cy="9" r="6" />
      <path d="m17 17-3.5-3.5" />
    </svg>
  );
}

/**
 * Single-line search input with a leading icon slot.
 *
 * Note: the source site does not include a search input — this recipe is
 * synthesized from the canonical TextInput plus a leading-icon slot.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ icon, invalid, className, type, ...rest }, ref) {
    const cls = ["ds-input", className].filter(Boolean).join(" ");
    return (
      <span className="ds-search">
        <input
          ref={ref}
          type={type ?? "search"}
          className={cls}
          aria-invalid={invalid || undefined}
          {...rest}
        />
        {icon ?? <DefaultSearchIcon />}
      </span>
    );
  }
);
