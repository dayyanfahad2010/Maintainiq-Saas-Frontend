import { cn } from "@/utils/cn";

export function Badge({ children, className, tone = "neutral" }) {
  const tones = {
    neutral:
      "bg-[var(--color-surface-2)] text-[var(--color-ink-soft)] border-[var(--color-line)]",
    good: "bg-[color-mix(in_srgb,var(--color-good)_14%,transparent)] text-[var(--color-good)] border-[color-mix(in_srgb,var(--color-good)_35%,transparent)]",
    warn: "bg-[color-mix(in_srgb,var(--color-warn)_14%,transparent)] text-[var(--color-warn)] border-[color-mix(in_srgb,var(--color-warn)_35%,transparent)]",
    critical:
      "bg-[color-mix(in_srgb,var(--color-critical)_14%,transparent)] text-[var(--color-critical)] border-[color-mix(in_srgb,var(--color-critical)_35%,transparent)]",
    info: "bg-[color-mix(in_srgb,var(--color-info)_14%,transparent)] text-[var(--color-info)] border-[color-mix(in_srgb,var(--color-info)_35%,transparent)]",
    amber:
      "bg-[color-mix(in_srgb,var(--color-amber)_18%,transparent)] text-[var(--color-amber-ink)] dark:text-[var(--color-amber)] border-[color-mix(in_srgb,var(--color-amber)_40%,transparent)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const ASSET_STATUS_TONE = {
  Operational: "good",
  "Issue Reported": "warn",
  "Under Inspection": "info",
  "Under Maintenance": "warn",
  "Out of Service": "critical",
  Retired: "neutral",
};

const ISSUE_STATUS_TONE = {
  Reported: "warn",
  Assigned: "info",
  "Inspection Started": "info",
  "Maintenance In Progress": "warn",
  "Waiting for Parts": "warn",
  Resolved: "good",
  Closed: "neutral",
  Reopened: "critical",
};

const PRIORITY_TONE = {
  Low: "neutral",
  Medium: "info",
  High: "warn",
  Critical: "critical",
};

export function AssetStatusBadge({ status }) {
  return <Badge tone={ASSET_STATUS_TONE[status] || "neutral"}>{status}</Badge>;
}

export function IssueStatusBadge({ status }) {
  return <Badge tone={ISSUE_STATUS_TONE[status] || "neutral"}>{status}</Badge>;
}

export function PriorityBadge({ priority }) {
  return <Badge tone={PRIORITY_TONE[priority] || "neutral"}>{priority}</Badge>;
}
