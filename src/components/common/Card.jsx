import { cn } from "@/utils/cn";

export default function Card({ className, children, tag = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] shadow-[var(--shadow-tag)]",
        tag && "corner-bracket",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children }) {
  return (
    <div className={cn("border-b border-[var(--color-line)] px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}
