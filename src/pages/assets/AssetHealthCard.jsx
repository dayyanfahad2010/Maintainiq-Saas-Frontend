import { Sparkles, RefreshCw, TrendingDown, Clock, AlertTriangle, Wrench } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { runAssetHealthAnalysis } from "@/features/ai/aiSlice";
import Card, { CardBody, CardHeader } from "@/components/common/Card";
import Button from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { formatCurrency } from "@/utils/format";

const PROBABILITY_TONE = {
  Low: "good",
  Medium: "info",
  High: "warn",
  Critical: "critical",
};

const SCORE_COLOR = (score) => {
  if (score >= 75) return "var(--color-good)";
  if (score >= 50) return "var(--color-info)";
  if (score >= 25) return "var(--color-warn)";
  return "var(--color-critical)";
};

function ScoreGauge({ score = 0 }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const color = SCORE_COLOR(score);

  return (
    <div className="relative flex size-28 shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-surface-2)" strokeWidth="10" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-[var(--font-display)] text-2xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-[var(--color-ink-soft)]">
          / 100
        </span>
      </div>
    </div>
  );
}

export default function AssetHealthCard({ assetId }) {
  const dispatch = useAppDispatch();
  const { health, healthStatus, healthError } = useAppSelector((s) => s.ai);

  const handleRun = () => dispatch(runAssetHealthAnalysis(assetId));

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]" />
          <h3 className="font-[var(--font-display)] font-semibold text-[var(--color-ink)]">
            AI predictive health
          </h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          icon={health ? RefreshCw : Sparkles}
          loading={healthStatus === "loading"}
          onClick={handleRun}
        >
          {health ? "Refresh" : "Analyze"}
        </Button>
      </CardHeader>
      <CardBody>
        {healthStatus === "idle" && !health && (
          <p className="text-sm text-[var(--color-ink-soft)]">
            Run a predictive analysis over this asset's full issue and maintenance history —
            health score, failure risk, and whether continued repair still makes sense.
          </p>
        )}

        {healthStatus === "failed" && (
          <p className="text-sm text-[var(--color-critical)]">
            {healthError || "Couldn't generate a health analysis right now."}
          </p>
        )}

        {health && (
          <div className="space-y-4">
            <div className="flex items-center gap-5">
              <ScoreGauge score={health.healthScore ?? 0} />
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={PROBABILITY_TONE[health.failureProbability] || "neutral"}>
                    {health.failureProbability || "Unknown"} failure risk
                  </Badge>
                  {health.confidence && (
                    <span className="text-xs text-[var(--color-ink-soft)]">
                      {health.confidence} confidence
                    </span>
                  )}
                </div>
                <p className="flex items-center gap-1.5 text-sm text-[var(--color-ink-soft)]">
                  <Clock className="size-3.5 shrink-0" />
                  Est. remaining useful life: {health.remainingUsefulLife || "Unknown"}
                </p>
                {health.basedOn && (
                  <p className="flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
                    <Wrench className="size-3.5 shrink-0" />
                    Based on {health.basedOn.issueCount} issue{health.basedOn.issueCount === 1 ? "" : "s"}
                    {health.basedOn.totalCost ? ` · ${formatCurrency(health.basedOn.totalCost)} spent` : ""}
                  </p>
                )}
              </div>
            </div>

            {health.recurringPattern && (
              <div className="flex items-start gap-2 rounded-md bg-[var(--color-warn)]/10 p-3 text-sm text-[var(--color-warn)]">
                <TrendingDown className="mt-0.5 size-4 shrink-0" />
                <span>{health.recurringPattern}</span>
              </div>
            )}

            {health.recommendation && (
              <div className="flex items-start gap-2 rounded-md border border-dashed border-[var(--color-amber)]/40 bg-[var(--color-amber)]/5 p-3 text-sm">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]" />
                <div>
                  <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-amber-ink)] dark:text-[var(--color-amber)]">
                    Recommendation
                  </p>
                  <p className="text-[var(--color-ink)]">{health.recommendation}</p>
                </div>
              </div>
            )}

            <p className="text-xs text-[var(--color-ink-soft)]">
              AI-generated and advisory — use it alongside a technician's judgment, not in place of it.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
