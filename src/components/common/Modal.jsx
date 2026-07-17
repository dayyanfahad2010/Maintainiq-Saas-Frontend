import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] shadow-xl max-h-[90vh] overflow-y-auto",
          sizes[size]
        )}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4">
          <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-ink)]"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
