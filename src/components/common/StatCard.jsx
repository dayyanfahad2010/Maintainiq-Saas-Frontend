import { cn } from "@/utils/cn";
import Card from "./Card";

export default function StatCard({ label, value, icon: Icon, tone = "neutral", hint, index = 0 }) {
  const tones = {
    neutral: "text-[var(--color-ink)]",
    good: "text-[var(--color-good)]",
    warn: "text-[var(--color-warn)]",
    critical: "text-[var(--color-critical)]",
    info: "text-[var(--color-info)]",
    amber: "text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]",
  };

  return (
    <Card
      className="relative animate-fade-in-up overflow-hidden p-5 transition-transform duration-150 hover:-translate-y-0.5"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
            {label}
          </p>
          <p className={cn("mt-2 font-[var(--font-display)] text-3xl font-bold", tones[tone])}>
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{hint}</p>}
        </div>
        {Icon && (
          <div className="rounded-md bg-[var(--color-surface-2)] p-2">
            <Icon className={cn("size-5", tones[tone])} />
          </div>
        )}
      </div>
    </Card>
  );
}
