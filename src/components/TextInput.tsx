import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ invalid, className, type, ...rest }, ref) {
    const cls = ["ds-input", className].filter(Boolean).join(" ");
    return (
      <input
        ref={ref}
        type={type ?? "text"}
        className={cls}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    );
  }
);
