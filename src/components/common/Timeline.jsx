import {
  PlusCircle,
  FileWarning,
  UserCheck,
  Search,
  Wrench,
  CheckCircle2,
  RotateCcw,
  Archive,
  Activity,
} from "lucide-react";
import { formatDateTime } from "@/utils/format";

const STAGES = [
  { match: /creat|regist/i, icon: PlusCircle, color: "var(--color-info)" },
  { match: /report/i, icon: FileWarning, color: "var(--color-warn)" },
  { match: /assign/i, icon: UserCheck, color: "var(--color-info)" },
  { match: /inspect/i, icon: Search, color: "var(--color-info)" },
  { match: /maintenance|repair|part/i, icon: Wrench, color: "var(--color-amber-ink)" },
  { match: /resolv|operational/i, icon: CheckCircle2, color: "var(--color-good)" },
  { match: /reopen/i, icon: RotateCcw, color: "var(--color-critical)" },
  { match: /retir/i, icon: Archive, color: "var(--color-ink-soft)" },
];

function stageFor(action = "") {
  return STAGES.find((s) => s.match.test(action)) || { icon: Activity, color: "var(--color-ink-soft)" };
}

export default function Timeline({ items }) {
  return (
    <ol className="relative px-5 py-4">
      {items.map((h, i) => {
        const { icon: Icon, color } = stageFor(h.action);
        const isLast = i === items.length - 1;

        return (
          <li key={h._id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[15px] top-8 bottom-0 w-px"
                style={{ backgroundColor: "var(--color-line)" }}
              />
            )}
            <span
              className="z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2"
              style={{ borderColor: color, backgroundColor: "var(--color-surface)" }}
            >
              <Icon className="size-3.5" style={{ color }} />
            </span>
            <div className="min-w-0 pt-1">
              <p className="text-sm font-medium text-[var(--color-ink)]">{h.action}</p>
              {h.details && <p className="text-sm text-[var(--color-ink-soft)]">{h.details}</p>}
              <p className="mt-1 font-[var(--font-mono)] text-xs text-[var(--color-ink-soft)]">
                {formatDateTime(h.createdAt)}
                {h.performedBy?.userName ? ` · ${h.performedBy.userName}` : ""}
                {h.issue?.issueNumber ? ` · ${h.issue.issueNumber}` : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
