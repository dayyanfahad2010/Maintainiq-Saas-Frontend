import { Link } from "react-router-dom";
import { CompassIcon } from "lucide-react";
import Button from "@/components/common/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-paper)] px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-surface-2)]">
        <CompassIcon className="size-6 text-[var(--color-ink-soft)]" />
      </div>
      <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
        404
      </p>
      <h1 className="font-[var(--font-display)] text-2xl font-bold text-[var(--color-ink)]">
        Page not found
      </h1>
      <p className="max-w-sm text-sm text-[var(--color-ink-soft)]">
        The asset tag or page you're looking for doesn't exist or may have been moved.
      </p>
      <Button as={Link} to="/">
        Back to home
      </Button>
    </div>
  );
}
