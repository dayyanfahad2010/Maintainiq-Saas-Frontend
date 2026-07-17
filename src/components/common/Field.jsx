import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const baseClass =
  "w-full rounded-[var(--radius-tag)] border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-soft)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)] focus:border-[var(--color-amber)] disabled:opacity-50 disabled:cursor-not-allowed";

export function Label({ children, htmlFor, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]"
    >
      {children}
      {required && <span className="text-[var(--color-critical)]"> *</span>}
    </label>
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-[var(--color-critical)]">{children}</p>;
}

export function FieldHint({ children }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">{children}</p>;
}

export const Input = forwardRef(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      baseClass,
      error && "border-[var(--color-critical)] focus:ring-[var(--color-critical)]",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef(({ className, error, rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(
      baseClass,
      "resize-y",
      error && "border-[var(--color-critical)] focus:ring-[var(--color-critical)]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Select = forwardRef(({ className, error, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      baseClass,
      "cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2397A1AB%22 stroke-width=%222%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-no-repeat bg-[right_0.9rem_center] bg-[length:16px] pr-9",
      error && "border-[var(--color-critical)] focus:ring-[var(--color-critical)]",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function FormField({ label, htmlFor, required, error, hint, children }) {
  return (
    <div>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      <FieldError>{error}</FieldError>
      {!error && <FieldHint>{hint}</FieldHint>}
    </div>
  );
}
