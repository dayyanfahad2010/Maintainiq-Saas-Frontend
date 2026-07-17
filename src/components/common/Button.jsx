import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

const variants = {
  primary:
    "bg-[var(--color-graphite)] text-white hover:bg-[var(--color-graphite-2)] dark:bg-[var(--color-amber)] dark:text-[var(--color-graphite)] dark:hover:brightness-95",
  amber:
    "bg-[var(--color-amber)] text-[var(--color-graphite)] hover:brightness-95",
  outline:
    "border border-[var(--color-line)] text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] bg-transparent",
  ghost:
    "text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] bg-transparent",
  danger: "bg-[var(--color-critical)] text-white hover:brightness-90",
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const Button = forwardRef(
  (
    {
      as: Component = "button",
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      className,
      children,
      icon: Icon,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-tag)] font-medium tracking-tight transition-all duration-150 active:scale-[0.97]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-amber)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-paper)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          Icon && <Icon className="size-4 shrink-0" />
        )}
        {children}
      </Component>
    );
  }
);

Button.displayName = "Button";
export default Button;
