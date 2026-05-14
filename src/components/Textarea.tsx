import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ invalid, className, rows, ...rest }, ref) {
    const cls = ["ds-textarea", className].filter(Boolean).join(" ");
    return (
      <textarea
        ref={ref}
        rows={rows ?? 5}
        className={cls}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    );
  }
);
