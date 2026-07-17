import { Loader2, Inbox, AlertTriangle } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";

export function Loader({ label = "Loading…", className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 text-[var(--color-ink-soft)] ${className}`}>
      <Loader2 className="size-6 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[var(--color-line)] px-6 py-16 text-center">
      <div className="rounded-full bg-[var(--color-surface-2)] p-3">
        <Icon className="size-6 text-[var(--color-ink-soft)]" />
      </div>
      <h3 className="font-[var(--font-display)] text-base font-semibold text-[var(--color-ink)]">
        {title}
      </h3>
      {description && (
        <p className="max-w-sm text-sm text-[var(--color-ink-soft)]">{description}</p>
      )}
      {action}
    </div>
  );
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-[var(--color-critical)]/30 bg-[var(--color-critical)]/5 px-6 py-12 text-center">
      <AlertTriangle className="size-6 text-[var(--color-critical)]" />
      <p className="max-w-sm text-sm text-[var(--color-ink)]">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-[var(--color-ink-soft)]">{description}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
